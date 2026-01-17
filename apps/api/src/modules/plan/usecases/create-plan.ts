import { generatePublicId } from "../../../lib/public-id";
import { tryPromise, unwrap } from "../../../lib/result";
import { addDays, parseDateOnly } from "../../../lib/utils/date";
import { ApiError } from "../../../middleware/error-handler";
import { CreatePlanResponse } from "../plan.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  CreatePlanInput as CreatePlanInputType,
  CreatePlanResponse as CreatePlanResponseType,
} from "../plan.dto";
import type { PlanGenerationPort } from "../plan.ports";
import type { PlanRepository } from "../plan.repository";

export function createPlan(deps: {
  readonly planRepository: PlanRepository;
  readonly planGeneration: PlanGenerationPort;
}) {
  return function createPlan(
    userId: string,
    input: CreatePlanInputType,
  ): ResultAsync<CreatePlanResponseType, AppError> {
    return tryPromise(async () => {
      const materialRows = await unwrap(
        deps.planRepository.findMaterialsByIds(input.materialIds),
      );

      const byId = new Map(
        materialRows.map((material) => [material.id, material] as const),
      );
      const ordered = input.materialIds
        .map((id) => byId.get(id))
        .filter(
          (material): material is (typeof materialRows)[number] =>
            material !== undefined,
        );

      if (ordered.length !== input.materialIds.length) {
        throw new ApiError(
          400,
          "PLAN_MATERIAL_NOT_READY",
          "선택된 자료를 찾을 수 없습니다.",
        );
      }

      for (const material of ordered) {
        if (material.userId !== userId) {
          throw new ApiError(403, "FORBIDDEN", "자료 접근 권한이 없습니다.");
        }
        if (material.deletedAt) {
          throw new ApiError(
            400,
            "PLAN_MATERIAL_NOT_READY",
            "삭제된 자료는 사용할 수 없습니다.",
          );
        }
        if (material.processingStatus !== "READY") {
          throw new ApiError(
            400,
            "PLAN_MATERIAL_NOT_READY",
            "일부 자료가 분석 완료되지 않았습니다.",
            { materialId: material.id },
          );
        }
      }

      const now = new Date();
      const planPublicId = generatePublicId();
      const targetDueDate = input.targetDueDate
        ? parseDateOnly(input.targetDueDate)
        : null;
      const startDate = parseDateOnly(new Date().toISOString().slice(0, 10));
      const icon = input.icon ?? "target";
      const color = input.color ?? "blue";

      const aiPlan = await deps.planGeneration.generatePlan({
        userId,
        materialIds: input.materialIds,
        goalType: input.goalType,
        currentLevel: input.currentLevel,
        targetDueDate,
        specialRequirements: input.specialRequirements ?? null,
        requestedSessionCount: null,
      });

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

      const sessionCount = sessions.length;
      const finalTargetDueDate = targetDueDate
        ? targetDueDate
        : addDays(new Date(), sessionCount);

      await unwrap(
        deps.planRepository.createPlanTransaction({
          userId,
          planData: {
            publicId: planPublicId,
            userId,
            title: aiPlan.title,
            icon,
            color,
            status: "ACTIVE",
            goalType: input.goalType,
            currentLevel: input.currentLevel,
            targetDueDate: finalTargetDueDate,
            specialRequirements: input.specialRequirements ?? null,
            startedAt: now,
            createdAt: now,
            updatedAt: now,
          },
          sourceRows: ordered.map((material, index) => ({
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
        }),
      );

      return CreatePlanResponse.parse({
        data: {
          id: planPublicId,
          title: aiPlan.title,
          icon,
          color,
          status: "ACTIVE" as const,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      });
    });
  };
}
