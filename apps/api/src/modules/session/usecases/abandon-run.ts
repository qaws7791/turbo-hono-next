import { tryPromise, unwrap } from "../../../lib/result";
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
    return tryPromise(async () => {
      const now = new Date();

      const run = await unwrap(
        deps.sessionRepository.findRunForAbandon(userId, runId),
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

      if (run.status !== "RUNNING") {
        throw new ApiError(
          400,
          "INVALID_REQUEST",
          "진행 중인 세션이 아닙니다.",
          {
            status: run.status,
          },
        );
      }

      await unwrap(
        deps.sessionRepository.abandonRunTransaction({
          run: { id: run.id, sessionId: run.sessionId },
          reason,
          now,
        }),
      );

      return AbandonSessionRunResponse.parse({
        data: { runId: run.publicId, status: "ABANDONED" },
      });
    });
  };
}
