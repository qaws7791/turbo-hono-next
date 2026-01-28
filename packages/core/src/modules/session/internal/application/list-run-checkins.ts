import { ok, safeTry } from "neverthrow";

import { isoDateTime } from "../../../../common/date";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { ListSessionCheckinsResponse } from "../../api/schema";
import type { SessionRepository } from "../infrastructure/session.repository";

export function listRunCheckins(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function listRunCheckins(
    userId: string,
    runId: string,
  ): ResultAsync<ListSessionCheckinsResponse, AppError> {
    return safeTry(async function* () {
      const rows = yield* deps.sessionRepository.listRunCheckins(userId, runId);

      return ok({
        data: rows.map((row) => ({
          id: row.id,
          kind: row.kind,
          prompt: row.prompt,
          responseJson: row.responseJson ?? null,
          recordedAt: isoDateTime(row.recordedAt),
        })),
      });
    });
  };
}
