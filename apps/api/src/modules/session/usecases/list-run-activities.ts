import { tryPromise, unwrap } from "../../../lib/result";
import { isoDateTime } from "../../../lib/utils/date";
import { ApiError } from "../../../middleware/error-handler";
import { ListSessionActivitiesResponse } from "../session.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { ListSessionActivitiesResponse as ListSessionActivitiesResponseType } from "../session.dto";
import type { SessionRepository } from "../session.repository";

export function listRunActivities(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function listRunActivities(
    userId: string,
    runId: string,
  ): ResultAsync<ListSessionActivitiesResponseType, AppError> {
    return tryPromise(async () => {
      const run = await unwrap(
        deps.sessionRepository.findRunByPublicId(userId, runId),
      );

      if (!run) {
        throw new ApiError(
          404,
          "SESSION_NOT_FOUND",
          "세션을 찾을 수 없습니다.",
          {
            runId,
          },
        );
      }

      const rows = await unwrap(deps.sessionRepository.listActivities(run.id));

      return ListSessionActivitiesResponse.parse({
        data: rows.map((row) => ({
          id: row.id,
          kind: row.kind,
          prompt: row.prompt,
          userAnswer: row.userAnswer ?? null,
          aiEvalJson: row.aiEvalJson ?? null,
          createdAt: isoDateTime(row.createdAt),
        })),
      });
    });
  };
}
