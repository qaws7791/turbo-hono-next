import { err, ok, safeTry } from "neverthrow";

import { coreError } from "../../../../common/core-error";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { CompleteSessionRunResponse } from "../../api/schema";
import type { SessionRepository } from "../infrastructure/session.repository";

export function completeRun(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function completeRun(
    userId: string,
    runId: string,
  ): ResultAsync<CompleteSessionRunResponse, AppError> {
    return safeTry(async function* () {
      const now = new Date();

      const run = yield* deps.sessionRepository.findRunByPublicId(
        userId,
        runId,
      );
      if (!run) {
        return err(
          coreError({
            code: "SESSION_NOT_FOUND",
            message: "세션을 찾을 수 없습니다.",
            details: { runId },
          }),
        );
      }

      if (run.status !== "RUNNING") {
        return err(
          coreError({
            code: "INVALID_REQUEST",
            message: "진행 중인 세션이 아닙니다.",
            details: { status: run.status },
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

      return ok({
        data: {
          runId: run.publicId,
          status: "COMPLETED" as const,
          summary: { id: summaryId },
        },
      });
    });
  };
}
