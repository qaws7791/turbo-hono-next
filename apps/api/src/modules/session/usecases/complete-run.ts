import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { CompleteSessionRunResponse } from "../session.dto";
import { sessionRepository } from "../session.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { CompleteSessionRunResponse as CompleteSessionRunResponseType } from "../session.dto";

export async function completeRun(
  userId: string,
  runId: string,
): Promise<Result<CompleteSessionRunResponseType, AppError>> {
  const now = new Date();

  // 1. Run 조회
  const runResult = await sessionRepository.findRunForCompletion(userId, runId);
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

  // 2. Run 완료 트랜잭션 실행
  const completeResult = await sessionRepository.completeRunTransaction({
    run: {
      id: run.id,
      publicId: run.publicId,
      sessionId: run.sessionId,
      planId: run.planId,
      spaceId: run.spaceId,
      startedAt: run.startedAt,
    },
    userId,
    now,
  });
  if (completeResult.isErr()) return err(completeResult.error);
  const { summaryId } = completeResult.value;

  // 3. 남은 세션 수 확인
  const remainingResult = await sessionRepository.countRemainingSessions(
    run.planId,
  );
  if (remainingResult.isErr()) return err(remainingResult.error);
  const remaining = remainingResult.value;

  // 4. 모든 세션 완료 시 Plan 완료 처리
  if (remaining === 0) {
    const markResult = await sessionRepository.markPlanCompleted(
      run.planId,
      now,
    );
    if (markResult.isErr()) return err(markResult.error);
  }

  return ok(
    CompleteSessionRunResponse.parse({
      data: {
        runId: run.publicId,
        status: "COMPLETED",
        summary: { id: summaryId },
      },
    }),
  );
}
