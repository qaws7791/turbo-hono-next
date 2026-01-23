import * as neverthrow from "neverthrow";

import { generatePublicId } from "../../../lib/public-id";
import { fromPromise } from "../../../lib/result";
import { parseDateOnly } from "../../../lib/utils/date";
import { parseOrInternalError } from "../../../lib/zod";
import { ApiError } from "../../../middleware/error-handler";
import { CreatePlanResponse } from "../plan.dto";

import type { Queue } from "bullmq";
import type {
  PlanGenerationJobData,
  PlanGenerationJobResult,
} from "../../../infrastructure/queue";
import type { AppError } from "../../../lib/result";
import type {
  CreatePlanInput as CreatePlanInputType,
  CreatePlanResponse as CreatePlanResponseType,
} from "../plan.dto";
import type { PlanRepository } from "../plan.repository";

const { err, ok } = neverthrow;

type PlanMaterialRow = {
  readonly id: string;
  readonly title: string;
  readonly processingStatus: string;
  readonly deletedAt: Date | null;
  readonly userId: string;
};

export type EnqueuePlanGenerationDeps = {
  readonly planRepository: PlanRepository;
  readonly planGenerationQueue: Queue<
    PlanGenerationJobData,
    PlanGenerationJobResult
  >;
};

function validateMaterials(
  materials: ReadonlyArray<PlanMaterialRow>,
  requestedIds: ReadonlyArray<string>,
  userId: string,
): neverthrow.Result<Array<PlanMaterialRow>, AppError> {
  const byId = new Map(
    materials.map((material) => [material.id, material] as const),
  );
  const ordered = requestedIds
    .map((id) => byId.get(id))
    .filter((material): material is PlanMaterialRow => material !== undefined);

  if (ordered.length !== requestedIds.length) {
    return err(
      new ApiError(
        400,
        "PLAN_MATERIAL_NOT_READY",
        "선택된 자료를 찾을 수 없습니다.",
      ),
    );
  }

  for (const material of ordered) {
    if (material.userId !== userId) {
      return err(new ApiError(403, "FORBIDDEN", "자료 접근 권한이 없습니다."));
    }
    if (material.deletedAt) {
      return err(
        new ApiError(
          400,
          "PLAN_MATERIAL_NOT_READY",
          "삭제된 자료는 사용할 수 없습니다.",
        ),
      );
    }
    if (material.processingStatus !== "READY") {
      return err(
        new ApiError(
          400,
          "PLAN_MATERIAL_NOT_READY",
          "일부 자료가 분석 완료되지 않았습니다.",
          { materialId: material.id },
        ),
      );
    }
  }

  return ok(ordered);
}

export function enqueuePlanGeneration(deps: EnqueuePlanGenerationDeps) {
  return function enqueue(
    userId: string,
    input: CreatePlanInputType,
  ): neverthrow.ResultAsync<CreatePlanResponseType, AppError> {
    return deps.planRepository
      .findMaterialsByIds(input.materialIds)
      .andThen((materialRows) =>
        validateMaterials(materialRows, input.materialIds, userId),
      )
      .andThen((materials) => {
        return fromPromise(
          (async () => {
            const now = new Date();
            const planPublicId = generatePublicId();
            const icon = input.icon ?? "target";
            const color = input.color ?? "blue";
            const targetDueDate = input.targetDueDate
              ? parseDateOnly(input.targetDueDate)
              : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default 1 week

            // 1. PENDING Plan 생성
            const createdPlanResult =
              await deps.planRepository.createPendingPlan({
                userId,
                planData: {
                  publicId: planPublicId,
                  userId,
                  title: "학습 계획 생성 중...", // 임시 제목
                  icon,
                  color,
                  status: "PAUSED", // 생성 중에는 PAUSED (또는 별도 상태 관리)
                  targetDueDate: targetDueDate,
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

            if (createdPlanResult.isErr()) return err(createdPlanResult.error);
            const { id: planId } = createdPlanResult.value;
            const jobId = `plan-${planId}`;

            // 2. Queue 등록
            try {
              await deps.planGenerationQueue.add(
                "generate-plan",
                {
                  userId,
                  planId: planId,
                  publicId: planPublicId,
                  materialIds: input.materialIds,
                  targetDueDate: targetDueDate.toISOString(),
                  specialRequirements: input.specialRequirements ?? null,
                  icon,
                  color,
                },
                {
                  jobId,
                  removeOnComplete: true, // 성공 시 데이터 삭제
                  removeOnFail: { count: 5 }, // 실패 시 최근 5개만 유지
                },
              );
            } catch (cause) {
              const failResult =
                await deps.planRepository.updateGenerationStatus(planId, {
                  generationStatus: "FAILED",
                  generationError: "작업 큐 등록에 실패했습니다.",
                  updatedAt: now,
                });
              if (failResult.isErr()) {
                // ignore
              }

              return err(
                new ApiError(
                  503,
                  "QUEUE_UNAVAILABLE",
                  "작업 큐가 사용 불가능합니다.",
                  { cause },
                ),
              );
            }

            // 3. 응답
            return parseOrInternalError(
              CreatePlanResponse,
              {
                data: {
                  id: planPublicId,
                  title: "학습 계획 생성 중...",
                  icon,
                  color,
                  status: "PAUSED",
                  generationStatus: "PENDING",
                  jobId,
                  createdAt: now.toISOString(),
                  updatedAt: now.toISOString(),
                },
              },
              "CreatePlanResponse",
            );
          })(),
        ).andThen((result) => result);
      });
  };
}
