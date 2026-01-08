import { err, ok } from "neverthrow";

import { generatePlanWithAi } from "../../../ai/plan/generate";
import { generatePublicId } from "../../../lib/public-id";
import { ApiError } from "../../../middleware/error-handler";
import { assertSpaceOwned } from "../../space";
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
  spaceId: string,
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

  // 2. Space 소유권 확인
  const spaceResult = await assertSpaceOwned(userId, spaceId);
  if (spaceResult.isErr()) return err(spaceResult.error);
  const space = spaceResult.value;

  // 3. Material 조회
  const materialsResult = await planRepository.findMaterialsByIds(
    validated.materialIds,
  );
  if (materialsResult.isErr()) return err(materialsResult.error);
  const materialRows = materialsResult.value;

  // 4. Material 정렬 및 검증
  const byId = new Map(
    materialRows.map((material) => [material.id, material] as const),
  );
  const ordered = validated.materialIds
    .map((id) => byId.get(id))
    .filter(
      (material): material is (typeof materialRows)[number] =>
        material !== undefined,
    );

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
    if (material.userId !== userId || material.spaceId !== space.id) {
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

  // 5. AI를 통한 개인화된 학습 계획 생성
  const now = new Date();
  const planPublicId = generatePublicId();
  const targetDueDate = parseDateOnly(validated.targetDueDate);
  const startDate = parseDateOnly(new Date().toISOString().slice(0, 10));

  let aiPlan;
  try {
    aiPlan = await generatePlanWithAi({
      userId,
      spaceId: space.id,
      spaceName: space.name,
      materialIds: validated.materialIds,
      goalType: validated.goalType,
      currentLevel: validated.currentLevel,
      targetDueDate,
      specialRequirements: validated.specialRequirements ?? null,
    });
  } catch (error) {
    // AI 생성 실패 시 폴백: 기본 템플릿 사용
    console.error("AI plan generation failed, using fallback:", error);
    aiPlan = buildFallbackPlan({
      materials: ordered,
      goalType: validated.goalType,
      spaceName: space.name,
    });
  }

  // 6. AI 결과를 DB 형식으로 변환
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
    orderIndex: idx,
    scheduledForDate: addDays(startDate, sess.dayOffset),
    estimatedMinutes: sess.estimatedMinutes,
    status: "SCHEDULED" as const,
    createdAt: now,
    updatedAt: now,
  }));

  // 7. Plan 트랜잭션 생성
  const createResult = await planRepository.createPlanTransaction({
    userId,
    spaceId: space.id,
    planData: {
      publicId: planPublicId,
      userId,
      spaceId: space.id,
      title: aiPlan.title,
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

  return ok(
    CreatePlanResponse.parse({
      data: {
        id: planPublicId,
        title: aiPlan.title,
        status: "ACTIVE" as const,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    }),
  );
}

/**
 * AI 생성 실패 시 사용할 폴백 계획
 */
function buildFallbackPlan(params: {
  readonly materials: ReadonlyArray<{
    readonly id: string;
    readonly title: string | null;
  }>;
  readonly goalType: string;
  readonly spaceName: string;
}) {
  const goalLabels: Record<string, string> = {
    JOB: "취업 준비",
    CERT: "자격증 취득",
    WORK: "업무 역량 강화",
    HOBBY: "자기계발",
    OTHER: "학습",
  };

  const title = `${params.spaceName} ${goalLabels[params.goalType] ?? "학습"} 계획`;

  const modules = params.materials.map((mat, idx) => ({
    title: mat.title ?? `Module ${idx + 1}`,
    description: `${mat.title ?? "자료"} 학습 모듈`,
    orderIndex: idx,
    materialId: mat.id,
  }));

  const sessions: Array<{
    sessionType: "LEARN" | "REVIEW";
    title: string;
    objective: string;
    estimatedMinutes: number;
    dayOffset: number;
    moduleIndex: number;
  }> = [];

  let dayOffset = 0;
  modules.forEach((mod, modIdx) => {
    const learnLabels = ["핵심 개념 정리", "심화 학습", "실습 및 정리"];
    learnLabels.forEach((label, sessIdx) => {
      sessions.push({
        sessionType: "LEARN",
        title: `Session ${sessIdx + 1}: ${label}`,
        objective: `${mod.title}의 ${label.toLowerCase()}을 완료합니다.`,
        estimatedMinutes: 30,
        dayOffset,
        moduleIndex: modIdx,
      });
      dayOffset += 1;
    });
  });

  // 복습 세션 추가
  sessions.push({
    sessionType: "REVIEW",
    title: "Review 1: 핵심 개념 복습",
    objective: "학습한 핵심 개념들을 복습하고 이해도를 점검합니다.",
    estimatedMinutes: 25,
    dayOffset,
    moduleIndex: modules.length - 1,
  });
  dayOffset += 1;

  sessions.push({
    sessionType: "REVIEW",
    title: "Review 2: 최종 점검",
    objective: "전체 학습 내용을 정리하고 목표 달성 여부를 확인합니다.",
    estimatedMinutes: 25,
    dayOffset,
    moduleIndex: modules.length - 1,
  });

  return {
    title,
    summary: `${params.spaceName}을(를) 위한 체계적인 학습 계획입니다.`,
    modules,
    sessions,
  };
}
