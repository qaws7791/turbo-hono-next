import { err, ok } from "neverthrow";

import { isoDateTime } from "../../../lib/utils/date";
import { ApiError } from "../../../middleware/error-handler";
import { ListSessionRunsInput, ListSessionRunsResponse } from "../session.dto";
import { sessionRepository } from "../session.repository";

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
      data: rows.map((row) => {
        // durationMinutes 계산: 완료된 경우 startedAt과 endedAt의 차이, 아닌 경우 0
        const durationMinutes = row.endedAt
          ? Math.max(
              0,
              Math.round(
                (row.endedAt.getTime() - row.startedAt.getTime()) / 60000,
              ),
            )
          : 0;

        return {
          runId: row.runId,
          status: row.status,
          startedAt: isoDateTime(row.startedAt),
          endedAt: row.endedAt ? isoDateTime(row.endedAt) : null,
          exitReason: row.exitReason,
          durationMinutes,
          sessionId: row.sessionId,
          sessionTitle: row.sessionTitle,
          sessionType: row.sessionType,
          planId: row.planId,
          planTitle: row.planTitle,
          planIcon: row.planIcon,
          planColor: row.planColor,
          summary: row.summary
            ? {
                id: row.summary.id,
                createdAt: isoDateTime(row.summary.createdAt),
              }
            : null,
        };
      }),
      meta: {
        total,
        page: validated.page,
        limit: validated.limit,
      },
    }),
  );
}
