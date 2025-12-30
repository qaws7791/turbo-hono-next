import { err, ok } from "neverthrow";

import { generatePublicId } from "../../../lib/public-id";
import { ApiError } from "../../../middleware/error-handler";
import { assertSpaceOwned } from "../../space";
import { CreatePlanInput, CreatePlanResponse } from "../plan.dto";
import { planRepository } from "../plan.repository";
import { addDays, buildPlanTitle, parseDateOnly } from "../plan.utils";

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

  // 5. Plan 데이터 구성
  const now = new Date();
  const planPublicId = generatePublicId();
  const title = buildPlanTitle(validated.goalType, space.name);
  const targetDueDate = parseDateOnly(validated.targetDueDate);

  const moduleRows = ordered.map((material, index) => ({
    id: crypto.randomUUID(),
    title: material.title ?? `Module ${index + 1}`,
    description: null,
    orderIndex: index,
    createdAt: now,
  }));

  const sessions: Array<{
    publicId: string;
    moduleId: string | null;
    sessionType: "LEARN" | "REVIEW";
    title: string;
    objective: string | null;
    orderIndex: number;
    scheduledForDate: Date;
    estimatedMinutes: number;
    status: "SCHEDULED";
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  const startDate = parseDateOnly(new Date().toISOString().slice(0, 10));
  let sessionIndex = 0;

  moduleRows.forEach((module) => {
    const baseDate = addDays(startDate, sessionIndex);
    const learnTitles = ["핵심 개념 정리", "심화 학습", "실습/정리"] as const;

    learnTitles.forEach((label, idx) => {
      sessions.push({
        publicId: generatePublicId(),
        moduleId: module.id,
        sessionType: "LEARN",
        title: `Session ${idx + 1}: ${label}`,
        objective: null,
        orderIndex: sessionIndex,
        scheduledForDate: addDays(baseDate, idx),
        estimatedMinutes: 25,
        status: "SCHEDULED" as const,
        createdAt: now,
        updatedAt: now,
      });
      sessionIndex += 1;
    });
  });

  sessions.push({
    publicId: generatePublicId(),
    moduleId: moduleRows.at(-1)?.id ?? null,
    sessionType: "REVIEW",
    title: "Review 1: 핵심 개념 복습",
    objective: null,
    orderIndex: sessionIndex,
    scheduledForDate: addDays(startDate, sessionIndex),
    estimatedMinutes: 20,
    status: "SCHEDULED" as const,
    createdAt: now,
    updatedAt: now,
  });
  sessionIndex += 1;

  sessions.push({
    publicId: generatePublicId(),
    moduleId: moduleRows.at(-1)?.id ?? null,
    sessionType: "REVIEW",
    title: "Review 2: 최종 점검",
    objective: null,
    orderIndex: sessionIndex,
    scheduledForDate: addDays(startDate, sessionIndex),
    estimatedMinutes: 20,
    status: "SCHEDULED" as const,
    createdAt: now,
    updatedAt: now,
  });

  // 6. Plan 트랜잭션 생성
  const createResult = await planRepository.createPlanTransaction({
    userId,
    spaceId: space.id,
    planData: {
      publicId: planPublicId,
      userId,
      spaceId: space.id,
      title,
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
      data: { id: planPublicId, title, status: "ACTIVE" as const },
    }),
  );
}
