import { err, ok, safeTry } from "neverthrow";

import { parseOrInternalError } from "../../../lib/zod";
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
    return safeTry(async function* () {
      const now = new Date();

      const run = yield* deps.sessionRepository.findRunForCompletion(
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

      const { summaryId } =
        yield* deps.sessionRepository.completeRunTransaction({
          run: {
            id: run.id,
            publicId: run.publicId,
            sessionId: run.sessionId,
            planId: run.planId,
            startedAt: run.startedAt,
          },
          userId,
          now,
        });

      const remaining = yield* deps.sessionRepository.countRemainingSessions(
        run.planId,
      );

      if (remaining === 0) {
        yield* deps.sessionRepository.markPlanCompleted(run.planId, now);
      }

      const response = yield* parseOrInternalError(
        CompleteSessionRunResponse,
        {
          data: {
            runId: run.publicId,
            status: "COMPLETED",
            summary: { id: summaryId },
          },
        },
        "CompleteSessionRunResponse",
      );

      return ok(response);
    });
  };
}
