import { tryPromise, unwrap } from "../../../lib/result";
import { ListPlansResponse } from "../plan.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  ListPlansInput as ListPlansInputType,
  ListPlansResponse as ListPlansResponseType,
} from "../plan.dto";
import type { PlanRepository } from "../plan.repository";

export function listPlans(deps: { readonly planRepository: PlanRepository }) {
  return function listPlans(
    userId: string,
    input: ListPlansInputType,
  ): ResultAsync<ListPlansResponseType, AppError> {
    return tryPromise(async () => {
      const total = await unwrap(
        deps.planRepository.countByUserId(userId, input.status),
      );

      const planRows = await unwrap(
        deps.planRepository.listByUserId(userId, {
          page: input.page,
          limit: input.limit,
          status: input.status,
        }),
      );

      const progressMap = await unwrap(
        deps.planRepository.getProgressMap(planRows.map((row) => row.id)),
      );

      const sourceMaterialIdsMap = await unwrap(
        deps.planRepository.getSourceMaterialIdsMap(
          planRows.map((row) => row.id),
        ),
      );

      return ListPlansResponse.parse({
        data: planRows.map((row) => {
          const progress = progressMap.get(row.id) ?? {
            totalSessions: 0,
            completedSessions: 0,
          };
          const sourceMaterialIds = sourceMaterialIdsMap.get(row.id) ?? [];

          return {
            id: row.publicId,
            title: row.title,
            icon: row.icon,
            color: row.color,
            status: row.status,
            goalType: row.goalType,
            currentLevel: row.currentLevel,
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
