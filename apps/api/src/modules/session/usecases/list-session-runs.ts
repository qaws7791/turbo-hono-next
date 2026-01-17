import { tryPromise, unwrap } from "../../../lib/result";
import { isoDateTime } from "../../../lib/utils/date";
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
    return tryPromise(async () => {
      const total = await unwrap(
        deps.sessionRepository.countSessionRuns(userId, {
          status: input.status,
        }),
      );

      const rows = await unwrap(
        deps.sessionRepository.listSessionRuns(userId, input),
      );

      return ListSessionRunsResponse.parse({
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
          page: input.page,
          limit: input.limit,
        },
      });
    });
  };
}
