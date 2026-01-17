import { tryPromise, unwrap } from "../../../lib/result";
import { ApiError } from "../../../middleware/error-handler";
import { CompleteSessionRunResponse } from "../session.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { CompleteSessionRunResponse as CompleteSessionRunResponseType } from "../session.dto";
import type { SessionRepository } from "../session.repository";

export function completeRun(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function completeRun(
    userId: string,
    runId: string,
  ): ResultAsync<CompleteSessionRunResponseType, AppError> {
    return tryPromise(async () => {
      const now = new Date();

      const run = await unwrap(
        deps.sessionRepository.findRunForCompletion(userId, runId),
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

      const { summaryId } = await unwrap(
        deps.sessionRepository.completeRunTransaction({
          run: {
            id: run.id,
            publicId: run.publicId,
            sessionId: run.sessionId,
            planId: run.planId,
            startedAt: run.startedAt,
          },
          userId,
          now,
        }),
      );

      const remaining = await unwrap(
        deps.sessionRepository.countRemainingSessions(run.planId),
      );

      if (remaining === 0) {
        await unwrap(deps.sessionRepository.markPlanCompleted(run.planId, now));
      }

      return CompleteSessionRunResponse.parse({
        data: {
          runId: run.publicId,
          status: "COMPLETED",
          summary: { id: summaryId },
        },
      });
    });
  };
}
