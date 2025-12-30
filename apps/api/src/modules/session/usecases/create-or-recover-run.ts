import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { sessionRepository } from "../session.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { CreateSessionRunResult } from "../session.dto";

export async function createOrRecoverRun(
  userId: string,
  sessionId: string,
): Promise<Result<CreateSessionRunResult, AppError>> {
  const now = new Date();

  // 1. Session 조회
  const sessionResult = await sessionRepository.findSessionByPublicId(
    userId,
    sessionId,
  );
  if (sessionResult.isErr()) return err(sessionResult.error);
  const session = sessionResult.value;

  if (!session) {
    return err(
      new ApiError(404, "SESSION_NOT_FOUND", "세션을 찾을 수 없습니다.", {
        sessionId,
      }),
    );
  }

  if (session.status === "COMPLETED") {
    return err(
      new ApiError(400, "SESSION_ALREADY_COMPLETED", "이미 완료된 세션입니다."),
    );
  }

  // 2. 진행 중인 Run 조회
  const existingResult = await sessionRepository.findRunningRun(
    userId,
    session.id,
  );
  if (existingResult.isErr()) return err(existingResult.error);
  const existing = existingResult.value;

  // 3. 기존 Run이 있으면 복구
  if (existing) {
    const stepResult = await sessionRepository.getLastSnapshotStep(existing.id);
    if (stepResult.isErr()) return err(stepResult.error);
    const currentStep = stepResult.value;

    return ok({
      statusCode: 200 as const,
      data: {
        runId: existing.publicId,
        sessionId: session.publicId,
        status: "RUNNING" as const,
        isRecovery: true,
        currentStep,
      },
    });
  }

  // 4. 새 Run 생성
  const createResult = await sessionRepository.createRunWithSessionUpdate({
    session: {
      id: session.id,
      publicId: session.publicId,
      planId: session.planId,
      spaceId: session.spaceId,
    },
    userId,
    now,
  });
  if (createResult.isErr()) return err(createResult.error);
  const { publicId: runPublicId } = createResult.value;

  return ok({
    statusCode: 201 as const,
    data: {
      runId: runPublicId,
      sessionId: session.publicId,
      status: "RUNNING" as const,
      isRecovery: false,
      currentStep: 0,
    },
  });
}
