import { ok, safeTry } from "neverthrow";

import { isoDateTime } from "../../../../common/date";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { ListSessionActivitiesResponse } from "../../api/schema";
import type { SessionRepository } from "../infrastructure/session.repository";

export function listRunActivities(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function listRunActivities(
    userId: string,
    runId: string,
  ): ResultAsync<ListSessionActivitiesResponse, AppError> {
    return safeTry(async function* () {
      const rows = yield* deps.sessionRepository.listRunActivities(
        userId,
        runId,
      );

      return ok({
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
