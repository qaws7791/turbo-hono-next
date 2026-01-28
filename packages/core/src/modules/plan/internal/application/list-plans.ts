import { ok, safeTry } from "neverthrow";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { ListPlansInput, ListPlansResponse } from "../../api";
import type { PlanRepository } from "../infrastructure/plan.repository";

export function listPlans(deps: { readonly planRepository: PlanRepository }) {
  return function listPlans(
    userId: string,
    input: ListPlansInput,
  ): ResultAsync<ListPlansResponse, AppError> {
    return safeTry(async function* () {
      const total = yield* deps.planRepository.countByUserId(
        userId,
        input.status,
      );

      const planRows = yield* deps.planRepository.listByUserId(userId, {
        page: input.page,
        limit: input.limit,
        status: input.status,
      });

      const progressMap = yield* deps.planRepository.getProgressMap(
        planRows.map((row) => row.id),
      );

      const sourceMaterialIdsMap =
        yield* deps.planRepository.getSourceMaterialIdsMap(
          planRows.map((row) => row.id),
        );

      return ok({
        data: planRows.map((row) => {
          const progress = progressMap.get(row.id)!;
          const sourceMaterialIds = sourceMaterialIdsMap.get(row.id)!;

          return {
            id: row.publicId,
            title: row.title,
            icon: row.icon,
            color: row.color,
            status: row.status,
            generationStatus: row.generationStatus,
            generationProgress: row.generationProgress ?? null,
            generationStep: row.generationStep ?? null,
            generationError: row.generationError ?? null,
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString(),
            progress: {
              completedSessions: progress.completedSessions,
              totalSessions: progress.totalSessions,
            },
            sourceMaterialIds,
          };
        }),
        meta: { total, page: input.page, limit: input.limit },
      });
    });
  };
}
