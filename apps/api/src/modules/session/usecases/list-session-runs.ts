import { ok, safeTry } from "neverthrow";

import { isoDateTime } from "../../../lib/utils/date";
import { parseOrInternalError } from "../../../lib/zod";
import { ListSessionRunsResponse } from "../session.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  ListSessionRunsInput as ListSessionRunsInputType,
  ListSessionRunsResponse as ListSessionRunsResponseType,
} from "../session.dto";
import type { SessionRepository } from "../session.repository";

export function listSessionRuns(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function listSessionRuns(
    userId: string,
    input: ListSessionRunsInputType,
  ): ResultAsync<ListSessionRunsResponseType, AppError> {
    return safeTry(async function* () {
      const total = yield* deps.sessionRepository.countSessionRuns(userId, {
        status: input.status,
      });

      const rows = yield* deps.sessionRepository.listSessionRuns(userId, input);

      const response = yield* parseOrInternalError(
        ListSessionRunsResponse,
        {
          data: rows.map((row) => {
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
            page: input.page,
            limit: input.limit,
          },
        },
        "ListSessionRunsResponse",
      );

      return ok(response);
    });
  };
}
