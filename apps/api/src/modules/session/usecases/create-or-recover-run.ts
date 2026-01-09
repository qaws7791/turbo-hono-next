import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { sessionRepository } from "../session.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { CreateSessionRunResult } from "../session.dto";

export async function createOrRecoverRun(
  userId: string,
  sessionId: string,
  idempotencyKey?: string,
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

  // 1.5 Idempotency-Key 처리(이전에 생성된 요청이면 동일 Run 반환)
  if (idempotencyKey) {
    const idempotencyResult = await sessionRepository.findRunByIdempotencyKey(
      userId,
      idempotencyKey,
    );
    if (idempotencyResult.isErr()) return err(idempotencyResult.error);
    const idempotentRun = idempotencyResult.value;

    if (idempotentRun) {
      if (idempotentRun.sessionId !== session.id) {
        return err(
          new ApiError(
            409,
            "IDEMPOTENCY_KEY_CONFLICT",
            "Idempotency-Key가 다른 세션에서 이미 사용되었습니다.",
            { idempotencyKey, sessionId },
          ),
        );
      }

      const stepResult = await sessionRepository.getLastSnapshotStep(
        idempotentRun.id,
      );
      if (stepResult.isErr()) return err(stepResult.error);
      const currentStep = stepResult.value;

      return ok({
        statusCode: 201 as const,
        data: {
          runId: idempotentRun.publicId,
          sessionId: session.publicId,
          status: idempotentRun.status,
          isRecovery: false,
          currentStep,
        },
      });
    }
  }

  if (session.status === "COMPLETED") {
    return err(
      new ApiError(400, "SESSION_ALREADY_COMPLETED", "이미 완료된 세션입니다."),
    );
  }
  if (session.status === "SKIPPED" || session.status === "CANCELED") {
    return err(
      new ApiError(
        400,
        "INVALID_REQUEST",
        "건너뜀/취소된 세션은 시작할 수 없습니다. 다시 예정으로 변경해주세요.",
        { status: session.status },
      ),
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
    },
    userId,
    now,
    idempotencyKey,
  });
  if (createResult.isErr()) {
    if (idempotencyKey) {
      const retryResult = await sessionRepository.findRunByIdempotencyKey(
        userId,
        idempotencyKey,
      );
      if (retryResult.isErr()) return err(retryResult.error);
      const run = retryResult.value;

      if (run) {
        if (run.sessionId !== session.id) {
          return err(
            new ApiError(
              409,
              "IDEMPOTENCY_KEY_CONFLICT",
              "Idempotency-Key가 다른 세션에서 이미 사용되었습니다.",
              { idempotencyKey, sessionId },
            ),
          );
        }

        const stepResult = await sessionRepository.getLastSnapshotStep(run.id);
        if (stepResult.isErr()) return err(stepResult.error);
        const currentStep = stepResult.value;

        return ok({
          statusCode: 201 as const,
          data: {
            runId: run.publicId,
            sessionId: session.publicId,
            status: run.status,
            isRecovery: false,
            currentStep,
          },
        });
      }
    }

    const existingRetryResult = await sessionRepository.findRunningRun(
      userId,
      session.id,
    );
    if (existingRetryResult.isErr()) return err(existingRetryResult.error);
    const existingRetry = existingRetryResult.value;

    if (existingRetry) {
      const stepResult = await sessionRepository.getLastSnapshotStep(
        existingRetry.id,
      );
      if (stepResult.isErr()) return err(stepResult.error);
      const currentStep = stepResult.value;

      return ok({
        statusCode: 200 as const,
        data: {
          runId: existingRetry.publicId,
          sessionId: session.publicId,
          status: "RUNNING" as const,
          isRecovery: true,
          currentStep,
        },
      });
    }

    return err(createResult.error);
  }
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
