import { tryPromise, unwrap } from "../../../lib/result";
import { formatIsoDate, formatIsoDatetime } from "../../../lib/utils/date";
import { ApiError } from "../../../middleware/error-handler";
import { PlanDetailResponse } from "../plan.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { MaterialRepository } from "../../material/material.repository";
import type { PlanDetailResponse as PlanDetailResponseType } from "../plan.dto";
import type { PlanRepository } from "../plan.repository";

export function getPlanDetail(deps: {
  readonly planRepository: PlanRepository;
  readonly materialRepository: MaterialRepository;
}) {
  return function getPlanDetail(
    userId: string,
    planId: string,
  ): ResultAsync<PlanDetailResponseType, AppError> {
    return tryPromise(async () => {
      const plan = await unwrap(
        deps.planRepository.findDetailByPublicId(userId, planId),
      );

      if (!plan) {
        throw new ApiError(404, "PLAN_NOT_FOUND", "Plan을 찾을 수 없습니다.", {
          planId,
        });
      }

      const modules = await unwrap(
        deps.planRepository.listModulesByPlanId(plan.internalId),
      );

      const sessions = await unwrap(
        deps.planRepository.listSessionsByPlanId(plan.internalId),
      );

      const sourceMaterialIds = await unwrap(
        deps.planRepository.listSourceMaterialIds(plan.internalId),
      );

      const materialsData = await unwrap(
        deps.materialRepository.findByIds(userId, sourceMaterialIds),
      );

      const totalSessions = sessions.length;
      const completedSessions = sessions.filter(
        (s) =>
          s.status === "COMPLETED" ||
          s.status === "SKIPPED" ||
          s.status === "CANCELED",
      ).length;

      return PlanDetailResponse.parse({
        data: {
          id: plan.id,
          title: plan.title,
          icon: plan.icon,
          color: plan.color,
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
          materials: materialsData.map((m) => ({
            id: m.id,
            title: m.title,
            summary: m.summary,
            sourceType: m.sourceType,
          })),
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
            completedAt: s.completedAt
              ? formatIsoDatetime(s.completedAt)
              : null,
          })),
        },
      });
    });
  };
}
