import { ok, safeTry } from "neverthrow";

import { isoDateTime } from "../../../../common/date";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type {
  CreateSessionActivityInput,
  CreateSessionActivityResponse,
} from "../../api/schema";
import type { SessionRepository } from "../infrastructure/session.repository";

export function createRunActivity(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function createRunActivity(
    userId: string,
    runId: string,
    input: CreateSessionActivityInput,
  ): ResultAsync<CreateSessionActivityResponse, AppError> {
    return safeTry(async function* () {
      const now = new Date();

      const inserted = yield* deps.sessionRepository.createRunActivity({
        userId,
        runId,
        kind: input.kind,
        prompt: input.prompt,
        userAnswer: input.userAnswer,
        aiEvalJson: input.aiEvalJson,
        createdAt: now,
      });

      return ok({
        data: {
          id: inserted.id,
          createdAt: isoDateTime(inserted.createdAt),
        },
      });
    });
  };
}
