import * as neverthrow from "neverthrow";

import { addDays, parseDateOnly } from "../../../../common/date";
import { coreError } from "../../../../common/core-error";
import { fromPromise } from "../../../../common/result";
import { generatePublicId } from "../../../../common/public-id";

import type { AppError } from "../../../../common/result";
import type { CreatePlanInput, CreatePlanResponse } from "../../api";
import type {
  PlanGenerationPort,
  PlanGenerationResult,
} from "../../api/plan-generation.port";
import type { PlanRepository } from "../infrastructure/plan.repository";

const { err, ok } = neverthrow;

type PlanMaterialRow = {
  readonly id: string;
  readonly title: string;
  readonly processingStatus: string;
  readonly deletedAt: Date | null;
  readonly userId: string;
};

type PlanTransactionInput = Parameters<
  PlanRepository["createPlanTransaction"]
>[0];

type PlanCreationPayload = {
  readonly transaction: PlanTransactionInput;
  readonly response: CreatePlanResponse["data"];
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

function createPlanEntities(params: {
  readonly userId: string;
  readonly input: CreatePlanInput;
  readonly materials: ReadonlyArray<PlanMaterialRow>;
  readonly aiPlan: PlanGenerationResult;
}): neverthrow.Result<PlanCreationPayload, AppError> {
  const now = new Date();
  const planPublicId = generatePublicId();
  const targetDueDate = params.input.targetDueDate
    ? parseDateOnly(params.input.targetDueDate)
    : null;
  const startDate = parseDateOnly(now.toISOString().slice(0, 10));
  const icon = params.input.icon ?? "target";
  const color = params.input.color ?? "blue";

  if (params.aiPlan.modules.length === 0) {
    return err(
      coreError({
        code: "PLAN_GENERATION_FAILED",
        message: "생성된 학습 계획에 모듈이 없습니다.",
      }),
    );
  }

  if (params.aiPlan.sessions.length === 0) {
    return err(
      coreError({
        code: "PLAN_GENERATION_FAILED",
        message: "생성된 학습 계획에 세션이 없습니다.",
      }),
    );
  }

  const moduleRows = params.aiPlan.modules.map((mod) => ({
    id: crypto.randomUUID(),
    title: mod.title,
    description: mod.description,
    orderIndex: mod.orderIndex,
    createdAt: now,
  }));

  const invalidSession = params.aiPlan.sessions.find(
    (session) => !moduleRows[session.moduleIndex],
  );
  if (invalidSession) {
    return err(
      coreError({
        code: "PLAN_GENERATION_FAILED",
        message: "세션의 모듈 참조가 올바르지 않습니다.",
        details: { moduleIndex: invalidSession.moduleIndex },
      }),
    );
  }

  const sessions = params.aiPlan.sessions.map((sess, idx) => ({
    publicId: generatePublicId(),
    moduleId: moduleRows[sess.moduleIndex]!.id,
    sessionType: sess.sessionType,
    title: sess.title,
    objective: sess.objective,
    sourceReferences: [...sess.sourceReferences],
    orderIndex: idx,
    scheduledForDate: addDays(startDate, sess.dayOffset),
    estimatedMinutes: sess.estimatedMinutes,
    status: "SCHEDULED" as const,
    createdAt: now,
    updatedAt: now,
  }));

  const sessionCount = sessions.length;
  const finalTargetDueDate =
    targetDueDate ?? addDays(new Date(now.getTime()), sessionCount);

  const transaction: PlanTransactionInput = {
    userId: params.userId,
    planData: {
      publicId: planPublicId,
      userId: params.userId,
      title: params.aiPlan.title,
      icon,
      color,
      status: "ACTIVE",
      targetDueDate: finalTargetDueDate,
      specialRequirements: params.input.specialRequirements ?? null,
      startedAt: now,
      generationStatus: "READY",
      createdAt: now,
      updatedAt: now,
    },
    sourceRows: params.materials.map((material, index) => ({
      planId: 0,
      materialId: material.id,
      materialTitleSnapshot: material.title ?? null,
      orderIndex: index,
      createdAt: now,
    })),
    moduleRows: moduleRows.map((moduleRow) => ({
      ...moduleRow,
      planId: 0,
    })),
    sessionRows: sessions.map((session) => ({ ...session, planId: 0 })),
  };

  return ok({
    transaction,
    response: {
      id: planPublicId,
      title: params.aiPlan.title,
      icon,
      color,
      status: "ACTIVE" as const,
      generationStatus: "READY" as const,
      generationProgress: null,
      generationStep: null,
      generationError: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  });
}

export function createPlan(deps: {
  readonly planRepository: PlanRepository;
  readonly planGeneration: PlanGenerationPort;
}) {
  return function createPlan(
    userId: string,
    input: CreatePlanInput,
  ): neverthrow.ResultAsync<CreatePlanResponse, AppError> {
    return deps.planRepository
      .findMaterialsByIds(input.materialIds)
      .andThen((materialRows) =>
        validateMaterials(materialRows, input.materialIds, userId),
      )
      .andThen((materials) =>
        deps.planGeneration
          .generatePlan({
            userId,
            materialIds: input.materialIds,
            targetDueDate: input.targetDueDate
              ? parseDateOnly(input.targetDueDate)
              : null,
            specialRequirements: input.specialRequirements ?? null,
            requestedSessionCount: null,
          })
          .map((aiPlan) => ({ materials, aiPlan })),
      )
      .andThen(({ materials, aiPlan }) =>
        fromPromise(
          Promise.resolve(
            createPlanEntities({
              userId,
              input,
              materials,
              aiPlan,
            }),
          ),
        )
          .andThen((result) => result)
          .andThen((payload) =>
            deps.planRepository
              .createPlanTransaction(payload.transaction)
              .map(() => payload.response),
          ),
      )
      .map((response) => ({ data: response }));
  };
}
