import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import {
  AbandonSessionRunResponse,
  SessionExitReasonSchema,
} from "../session.dto";
import { sessionRepository } from "../session.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  AbandonSessionRunResponse as AbandonSessionRunResponseType,
  SessionExitReason,
} from "../session.dto";

export async function abandonRun(
  userId: string,
  runId: string,
  reason: SessionExitReason,
): Promise<Result<AbandonSessionRunResponseType, AppError>> {
  const now = new Date();

  // 1. 이유 검증
  const parseResult = SessionExitReasonSchema.safeParse(reason);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validatedReason = parseResult.data;

  // 2. Run 조회
  const runResult = await sessionRepository.findRunForAbandon(userId, runId);
  if (runResult.isErr()) return err(runResult.error);
  const run = runResult.value;

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

  // 3. Run 포기 트랜잭션 실행
  const abandonResult = await sessionRepository.abandonRunTransaction({
    run: { id: run.id, sessionId: run.sessionId },
    reason: validatedReason,
    now,
  });
  if (abandonResult.isErr()) return err(abandonResult.error);

  return ok(
    AbandonSessionRunResponse.parse({
      data: { runId: run.publicId, status: "ABANDONED" },
    }),
  );
}
