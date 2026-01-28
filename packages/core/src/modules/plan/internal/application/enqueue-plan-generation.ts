import { err, ok, safeTry } from "neverthrow";

import { parseDateOnly } from "../../../../common/date";
import { coreError } from "../../../../common/core-error";
import { generatePublicId } from "../../../../common/public-id";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { CreatePlanInput, CreatePlanResponse } from "../../api";
import type { PlanGenerationQueuePort } from "../../api/plan-generation-queue.port";
import type { PlanRepository } from "../infrastructure/plan.repository";

type PlanMaterialRow = {
  readonly id: string;
  readonly title: string;
  readonly processingStatus: string;
  readonly deletedAt: Date | null;
  readonly userId: string;
};

function validateMaterials(
  materials: ReadonlyArray<PlanMaterialRow>,
  requestedIds: ReadonlyArray<string>,
  userId: string,
) {
  const byId = new Map(
    materials.map((material) => [material.id, material] as const),
  );
  const ordered = requestedIds
    .map((id) => byId.get(id))
    .filter((material): material is PlanMaterialRow => material !== undefined);

  if (ordered.length !== requestedIds.length) {
    return err(
      coreError({
        code: "PLAN_MATERIAL_NOT_READY",
        message: "선택된 자료를 찾을 수 없습니다.",
      }),
    );
  }

  for (const material of ordered) {
    if (material.userId !== userId) {
      return err(
        coreError({ code: "FORBIDDEN", message: "자료 접근 권한이 없습니다." }),
      );
    }
    if (material.deletedAt) {
      return err(
        coreError({
          code: "PLAN_MATERIAL_NOT_READY",
          message: "삭제된 자료는 사용할 수 없습니다.",
        }),
      );
    }
    if (material.processingStatus !== "READY") {
      return err(
        coreError({
          code: "PLAN_MATERIAL_NOT_READY",
          message: "일부 자료가 분석 완료되지 않았습니다.",
          details: { materialId: material.id },
        }),
      );
    }
  }

  return ok(ordered);
}

export type EnqueuePlanGenerationDeps = {
  readonly planRepository: PlanRepository;
  readonly planGenerationQueue: PlanGenerationQueuePort;
};

export function enqueuePlanGeneration(deps: EnqueuePlanGenerationDeps) {
  return function enqueue(
    userId: string,
    input: CreatePlanInput,
  ): ResultAsync<CreatePlanResponse, AppError> {
    return safeTry(async function* () {
      const materialRows = yield* deps.planRepository.findMaterialsByIds(
        input.materialIds,
      );
      const validated = validateMaterials(
        materialRows,
        input.materialIds,
        userId,
      );
      if (validated.isErr()) return err(validated.error);
      const materials = validated.value;

      const now = new Date();
      const planPublicId = generatePublicId();
      const icon = input.icon ?? "target";
      const color = input.color ?? "blue";
      const targetDueDate = input.targetDueDate
        ? parseDateOnly(input.targetDueDate)
        : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const createdPlanResult = yield* deps.planRepository.createPendingPlan({
        userId,
        planData: {
          publicId: planPublicId,
          userId,
          title: "학습 계획 생성 중...",
          icon,
          color,
          status: "PAUSED",
          targetDueDate,
          specialRequirements: input.specialRequirements ?? null,
          generationStatus: "PENDING",
          createdAt: now,
          updatedAt: now,
        },
        sourceRows: materials.map((material, index) => ({
          materialId: material.id,
          materialTitleSnapshot: material.title ?? null,
          orderIndex: index,
          createdAt: now,
        })),
      });

      const jobId = `plan-${createdPlanResult.id}`;

      const enqueueAttempt = await deps.planGenerationQueue.add(
        "generate-plan",
        {
          userId,
          planId: createdPlanResult.id,
          publicId: planPublicId,
          materialIds: input.materialIds,
          targetDueDate: targetDueDate.toISOString(),
          specialRequirements: input.specialRequirements ?? null,
          icon,
          color,
        },
        {
          jobId,
          removeOnComplete: true,
          removeOnFail: { count: 5 },
        },
      );

      if (enqueueAttempt.isErr()) {
        const failedAt = new Date();
        const failResult = await deps.planRepository.updateGenerationStatus(
          createdPlanResult.id,
          {
            generationStatus: "FAILED",
            generationError: "작업 큐 등록에 실패했습니다.",
            updatedAt: failedAt,
          },
        );
        if (failResult.isErr()) {
          // ignore
        }

        return err(
          coreError({
            code: "QUEUE_UNAVAILABLE",
            message: "작업 큐가 사용 불가능합니다.",
            details: { cause: enqueueAttempt.error },
          }),
        );
      }

      return ok({
        data: {
          id: planPublicId,
          title: "학습 계획 생성 중...",
          icon,
          color,
          status: "PAUSED" as const,
          generationStatus: "PENDING" as const,
          generationProgress: null,
          generationStep: null,
          generationError: null,
          jobId,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      });
    });
  };
}
