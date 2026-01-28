import { ok, safeTry } from "neverthrow";

import { isoDateTime } from "../../../../common/date";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type {
  UpdateSessionRunProgressInput,
  UpdateSessionRunProgressResponse,
} from "../../api/schema";
import type { SessionRepository } from "../infrastructure/session.repository";

export function saveProgress(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function saveProgress(
    userId: string,
    runId: string,
    input: UpdateSessionRunProgressInput,
  ): ResultAsync<UpdateSessionRunProgressResponse, AppError> {
    return safeTry(async function* () {
      const now = new Date();

      const saved = yield* deps.sessionRepository.insertProgressSnapshot({
        userId,
        runId,
        stepIndex: input.stepIndex,
        payloadJson: input.inputs,
        createdAt: now,
      });

      return ok({
        data: { runId: saved.runId, savedAt: isoDateTime(saved.savedAt) },
      });
    });
  };
}
