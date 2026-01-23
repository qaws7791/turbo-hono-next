import { ok, safeTry } from "neverthrow";

import { parseOrInternalError } from "../../../lib/zod";
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

      const response = yield* parseOrInternalError(
        ListPlansResponse,
        {
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
        },
        "ListPlansResponse",
      );

      return ok(response);
    });
  };
}
