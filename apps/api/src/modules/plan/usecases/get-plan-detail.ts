import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { PlanDetailResponse } from "../plan.dto";
import { planRepository } from "../plan.repository";
import { formatIsoDate, formatIsoDatetime } from "../plan.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { PlanDetailResponse as PlanDetailResponseType } from "../plan.dto";

export async function getPlanDetail(
  userId: string,
  planId: string,
): Promise<Result<PlanDetailResponseType, AppError>> {
  // 1. Plan 상세 조회
  const planResult = await planRepository.findDetailByPublicId(userId, planId);
  if (planResult.isErr()) return err(planResult.error);
  const plan = planResult.value;

  if (!plan) {
    return err(
      new ApiError(404, "PLAN_NOT_FOUND", "Plan을 찾을 수 없습니다.", {
        planId,
      }),
    );
  }

  // 2. 모듈 목록 조회
  const modulesResult = await planRepository.listModulesByPlanId(
    plan.internalId,
  );
  if (modulesResult.isErr()) return err(modulesResult.error);
  const modules = modulesResult.value;

  // 3. 세션 목록 조회
  const sessionsResult = await planRepository.listSessionsByPlanId(
    plan.internalId,
  );
  if (sessionsResult.isErr()) return err(sessionsResult.error);
  const sessions = sessionsResult.value;

  // 4. 소스 자료 ID 조회
  const sourceMaterialIdsResult = await planRepository.listSourceMaterialIds(
    plan.internalId,
  );
  if (sourceMaterialIdsResult.isErr())
    return err(sourceMaterialIdsResult.error);
  const sourceMaterialIds = sourceMaterialIdsResult.value;

  // 5. 진행률 계산
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(
    (s) =>
      s.status === "COMPLETED" ||
      s.status === "SKIPPED" ||
      s.status === "CANCELED",
  ).length;

  return ok(
    PlanDetailResponse.parse({
      data: {
        id: plan.id,
        spaceId: plan.spaceId,
        title: plan.title,
        status: plan.status,
        goalType: plan.goalType,
        currentLevel: plan.currentLevel,
        targetDueDate: formatIsoDate(plan.targetDueDate),
        specialRequirements: plan.specialRequirements ?? null,
        createdAt: formatIsoDatetime(plan.createdAt),
        updatedAt: formatIsoDatetime(plan.updatedAt),
        progress: {
          completedSessions,
          totalSessions,
        },
        sourceMaterialIds,
        modules: modules.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          orderIndex: m.orderIndex,
        })),
        sessions: sessions.map((s) => ({
          id: s.id,
          moduleId: s.moduleId,
          sessionType: s.sessionType,
          title: s.title,
          objective: s.objective,
          orderIndex: s.orderIndex,
          scheduledForDate: formatIsoDate(s.scheduledForDate),
          estimatedMinutes: s.estimatedMinutes,
          status: s.status,
          completedAt: s.completedAt ? formatIsoDatetime(s.completedAt) : null,
        })),
      },
    }),
  );
}
