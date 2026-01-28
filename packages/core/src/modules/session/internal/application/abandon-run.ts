import { err, ok, safeTry } from "neverthrow";

import { coreError } from "../../../../common/core-error";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type {
  AbandonSessionRunResponse,
  SessionExitReason,
} from "../../api/schema";
import type { SessionRepository } from "../infrastructure/session.repository";

export function abandonRun(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function abandonRun(
    userId: string,
    runId: string,
    reason: SessionExitReason,
  ): ResultAsync<AbandonSessionRunResponse, AppError> {
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

      yield* deps.sessionRepository.abandonRunTransaction({
        run: { id: run.id, sessionId: run.sessionId },
        reason,
        now,
      });

      return ok({
        data: { runId: run.publicId, status: "ABANDONED" as const },
      });
    });
  };
}
