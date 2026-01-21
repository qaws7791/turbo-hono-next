import { err, ok, safeTry } from "neverthrow";

import { parseOrInternalError } from "../../../lib/zod";
import { ApiError } from "../../../middleware/error-handler";
import { AbandonSessionRunResponse } from "../session.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  AbandonSessionRunResponse as AbandonSessionRunResponseType,
  SessionExitReason,
} from "../session.dto";
import type { SessionRepository } from "../session.repository";

export function abandonRun(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function abandonRun(
    userId: string,
    runId: string,
    reason: SessionExitReason,
  ): ResultAsync<AbandonSessionRunResponseType, AppError> {
    return safeTry(async function* () {
      const now = new Date();

      const run = yield* deps.sessionRepository.findRunForAbandon(
        userId,
        runId,
      );
      if (!run) {
        return err(
          new ApiError(404, "SESSION_NOT_FOUND", "세션을 찾을 수 없습니다.", {
            runId,
          }),
        );
      }

      if (run.status !== "RUNNING") {
        return err(
          new ApiError(400, "INVALID_REQUEST", "진행 중인 세션이 아닙니다.", {
            status: run.status,
          }),
        );
      }

      yield* deps.sessionRepository.abandonRunTransaction({
        run: { id: run.id, sessionId: run.sessionId },
        reason,
        now,
      });

      const response = yield* parseOrInternalError(
        AbandonSessionRunResponse,
        {
          data: { runId: run.publicId, status: "ABANDONED" },
        },
        "AbandonSessionRunResponse",
      );

      return ok(response);
    });
  };
}
