import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { ListSessionRunsInput, ListSessionRunsResponse } from "../session.dto";
import { sessionRepository } from "../session.repository";
import { isoDateTime } from "../session.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { ListSessionRunsResponse as ListSessionRunsResponseType } from "../session.dto";

export async function listSessionRuns(
  userId: string,
  input: unknown,
): Promise<Result<ListSessionRunsResponseType, AppError>> {
  const parseResult = ListSessionRunsInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

  const totalResult = await sessionRepository.countSessionRuns(userId, {
    status: validated.status,
  });
  if (totalResult.isErr()) return err(totalResult.error);
  const total = totalResult.value;

  const rowsResult = await sessionRepository.listSessionRuns(userId, validated);
  if (rowsResult.isErr()) return err(rowsResult.error);
  const rows = rowsResult.value;

  return ok(
    ListSessionRunsResponse.parse({
      data: rows.map((row) => ({
        runId: row.runId,
        status: row.status,
        startedAt: isoDateTime(row.startedAt),
        endedAt: row.endedAt ? isoDateTime(row.endedAt) : null,
        exitReason: row.exitReason,
        sessionId: row.sessionId,
        sessionTitle: row.sessionTitle,
        sessionType: row.sessionType,
        planId: row.planId,
        planTitle: row.planTitle,
        spaceId: row.spaceId,
        spaceName: row.spaceName,
        summary: row.summary
          ? {
              id: row.summary.id,
              conceptsCreatedCount: row.summary.conceptsCreatedCount,
              conceptsUpdatedCount: row.summary.conceptsUpdatedCount,
              reviewsScheduledCount: row.summary.reviewsScheduledCount,
              createdAt: isoDateTime(row.summary.createdAt),
            }
          : null,
      })),
      meta: {
        total,
        page: validated.page,
        limit: validated.limit,
      },
    }),
  );
}
