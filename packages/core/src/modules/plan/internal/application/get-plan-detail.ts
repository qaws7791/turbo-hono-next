import { err, ok, safeTry } from "neverthrow";

import { formatIsoDate, formatIsoDatetime } from "../../../../common/date";
import { coreError } from "../../../../common/core-error";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { MaterialReaderPort, PlanDetailResponse } from "../../api";
import type { PlanRepository } from "../infrastructure/plan.repository";

export function getPlanDetail(deps: {
  readonly planRepository: PlanRepository;
  readonly materialReader: MaterialReaderPort;
}) {
  return function getPlanDetail(
    userId: string,
    planId: string,
  ): ResultAsync<PlanDetailResponse, AppError> {
    return safeTry(async function* () {
      const plan = yield* deps.planRepository.findDetailByPublicId(
        userId,
        planId,
      );
      if (!plan) {
        return err(
          coreError({
            code: "PLAN_NOT_FOUND",
            message: "Plan을 찾을 수 없습니다.",
            details: { planId },
          }),
        );
      }

      const modules = yield* deps.planRepository.listModulesByPlanId(
        plan.internalId,
      );

      const sessions = yield* deps.planRepository.listSessionsByPlanId(
        plan.internalId,
      );

      const sourceMaterialIds =
        yield* deps.planRepository.listSourceMaterialIds(plan.internalId);

      const materialsData = yield* deps.materialReader.findByIds(
        userId,
        sourceMaterialIds,
      );

      const totalSessions = sessions.length;
      const completedSessions = sessions.filter(
        (s) =>
          s.status === "COMPLETED" ||
          s.status === "SKIPPED" ||
          s.status === "CANCELED",
      ).length;

      return ok({
        data: {
          id: plan.id,
          title: plan.title,
          icon: plan.icon,
          color: plan.color,
          status: plan.status,
          generationStatus: plan.generationStatus,
          generationProgress: plan.generationProgress ?? null,
          generationStep: plan.generationStep ?? null,
          generationError: plan.generationError ?? null,
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
            mimeType: m.mimeType,
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
            status: s.status as never,
            completedAt: s.completedAt
              ? formatIsoDatetime(s.completedAt)
              : null,
          })),
        },
      });
    });
  };
}
