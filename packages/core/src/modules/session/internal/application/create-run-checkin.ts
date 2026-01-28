import { ok, safeTry } from "neverthrow";

import { isoDateTime } from "../../../../common/date";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type {
  CreateSessionCheckinInput,
  CreateSessionCheckinResponse,
} from "../../api/schema";
import type { SessionRepository } from "../infrastructure/session.repository";

export function createRunCheckin(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function createRunCheckin(
    userId: string,
    runId: string,
    input: CreateSessionCheckinInput,
  ): ResultAsync<CreateSessionCheckinResponse, AppError> {
    return safeTry(async function* () {
      const now = new Date();

      const inserted = yield* deps.sessionRepository.createRunCheckin({
        userId,
        runId,
        kind: input.kind,
        prompt: input.prompt,
        responseJson: input.responseJson,
        recordedAt: now,
      });

      return ok({
        data: {
          id: inserted.id,
          recordedAt: isoDateTime(inserted.recordedAt),
        },
      });
    });
  };
}
