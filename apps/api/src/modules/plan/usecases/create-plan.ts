import { err, ok } from "neverthrow";

import { generatePlanWithAi } from "../../../ai/plan/generate";
import { logger } from "../../../lib/logger";
import { generatePublicId } from "../../../lib/public-id";
import { ApiError } from "../../../middleware/error-handler";
import { CreatePlanInput, CreatePlanResponse } from "../plan.dto";
import { planRepository } from "../plan.repository";
import { addDays, parseDateOnly } from "../plan.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  CreatePlanInput as CreatePlanInputType,
  CreatePlanResponse as CreatePlanResponseType,
} from "../plan.dto";

export async function createPlan(
  userId: string,
  input: CreatePlanInputType,
): Promise<Result<CreatePlanResponseType, AppError>> {
  // 1. 입력 검증
  const parseResult = CreatePlanInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;
  logger.info({ userId, validated }, "createPlan - validation");
  // 2. Material 조회
  const materialsResult = await planRepository.findMaterialsByIds(
    validated.materialIds,
  );
  if (materialsResult.isErr()) return err(materialsResult.error);
  const materialRows = materialsResult.value;
  logger.info({ userId, materialRows }, "createPlan - material");
  // 3. Material 정렬 및 검증
  const byId = new Map(
    materialRows.map((material) => [material.id, material] as const),
  );
  const ordered = validated.materialIds
    .map((id) => byId.get(id))
    .filter(
      (material): material is (typeof materialRows)[number] =>
        material !== undefined,
    );
  logger.info({ userId, ordered }, "createPlan - material order");
  if (ordered.length !== validated.materialIds.length) {
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

  // 4. AI를 통한 개인화된 학습 계획 생성
  const now = new Date();
  const planPublicId = generatePublicId();
  const targetDueDate = validated.targetDueDate
    ? parseDateOnly(validated.targetDueDate)
    : null;
  const startDate = parseDateOnly(new Date().toISOString().slice(0, 10));
  const icon = validated.icon ?? "target";
  const color = validated.color ?? "blue";
  logger.info(
    { userId, planPublicId, targetDueDate, startDate, icon, color },
    "createPlan - aiPlan",
  );
  // AI를 통한 개인화된 학습 계획 생성 (폴백 없음 - 에러는 그대로 전파)
  const aiPlan = await generatePlanWithAi({
    userId,
    materialIds: validated.materialIds,
    goalType: validated.goalType,
    currentLevel: validated.currentLevel,
    targetDueDate,
    specialRequirements: validated.specialRequirements ?? null,
    requestedSessionCount: null, // TODO: API 스키마 확장 후 사용자 입력값 연결
  });
  logger.info({ userId, aiPlan }, "createPlan - aiPlan");
  // 5. AI 결과를 DB 형식으로 변환
  const moduleRows = aiPlan.modules.map((mod) => ({
    id: crypto.randomUUID(),
    title: mod.title,
    description: mod.description,
    orderIndex: mod.orderIndex,
    createdAt: now,
  }));

  const sessions = aiPlan.sessions.map((sess, idx) => ({
    publicId: generatePublicId(),
    moduleId: moduleRows[sess.moduleIndex]?.id ?? moduleRows[0]?.id ?? null,
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
  logger.info(
    { userId, moduleRows, sessions },
    "createPlan - moduleRows, sessions",
  );
  // 6. Plan 트랜잭션 생성
  const createResult = await planRepository.createPlanTransaction({
    userId,
    planData: {
      publicId: planPublicId,
      userId,
      title: aiPlan.title,
      icon,
      color,
      status: "ACTIVE",
      goalType: validated.goalType,
      currentLevel: validated.currentLevel,
      targetDueDate,
      specialRequirements: validated.specialRequirements ?? null,
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    sourceRows: ordered.map((material, index) => ({
      planId: 0, // Will be set in transaction
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
  });
  if (createResult.isErr()) return err(createResult.error);
  logger.info({ userId, createResult }, "createPlan - createResult");
  return ok(
    CreatePlanResponse.parse({
      data: {
        id: planPublicId,
        title: aiPlan.title,
        icon,
        color,
        status: "ACTIVE" as const,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    }),
  );
}
