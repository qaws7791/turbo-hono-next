import { throwAppError, tryPromise, unwrap } from "../../../lib/result";
import { ApiError } from "../../../middleware/error-handler";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { CreateSessionRunResult } from "../session.dto";
import type { SessionRepository } from "../session.repository";

export function createOrRecoverRun(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function createOrRecoverRun(
    userId: string,
    sessionId: string,
    idempotencyKey?: string,
  ): ResultAsync<CreateSessionRunResult, AppError> {
    return tryPromise(async () => {
      const now = new Date();

      const session = await unwrap(
        deps.sessionRepository.findSessionByPublicId(userId, sessionId),
      );

      if (!session) {
        throw new ApiError(
          404,
          "SESSION_NOT_FOUND",
          "세션을 찾을 수 없습니다.",
          {
            sessionId,
          },
        );
      }

      if (idempotencyKey) {
        const idempotentRun = await unwrap(
          deps.sessionRepository.findRunByIdempotencyKey(
            userId,
            idempotencyKey,
          ),
        );

        if (idempotentRun) {
          if (idempotentRun.sessionId !== session.id) {
            throw new ApiError(
              409,
              "IDEMPOTENCY_KEY_CONFLICT",
              "Idempotency-Key가 다른 세션에서 이미 사용되었습니다.",
              { idempotencyKey, sessionId },
            );
          }

          const currentStep = await unwrap(
            deps.sessionRepository.getLastSnapshotStep(idempotentRun.id),
          );

          return {
            statusCode: 201 as const,
            data: {
              runId: idempotentRun.publicId,
              sessionId: session.publicId,
              status: idempotentRun.status,
              isRecovery: false,
              currentStep,
            },
          };
        }
      }

      if (session.status === "COMPLETED") {
        throw new ApiError(
          400,
          "SESSION_ALREADY_COMPLETED",
          "이미 완료된 세션입니다.",
        );
      }
      if (session.status === "SKIPPED" || session.status === "CANCELED") {
        throw new ApiError(
          400,
          "INVALID_REQUEST",
          "건너뜀/취소된 세션은 시작할 수 없습니다. 다시 예정으로 변경해주세요.",
          { status: session.status },
        );
      }

      const existing = await unwrap(
        deps.sessionRepository.findRunningRun(userId, session.id),
      );

      if (existing) {
        const currentStep = await unwrap(
          deps.sessionRepository.getLastSnapshotStep(existing.id),
        );

        return {
          statusCode: 200 as const,
          data: {
            runId: existing.publicId,
            sessionId: session.publicId,
            status: "RUNNING" as const,
            isRecovery: true,
            currentStep,
          },
        };
      }

      const createResult =
        await deps.sessionRepository.createRunWithSessionUpdate({
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
          const run = await unwrap(
            deps.sessionRepository.findRunByIdempotencyKey(
              userId,
              idempotencyKey,
            ),
          );

          if (run) {
            if (run.sessionId !== session.id) {
              throw new ApiError(
                409,
                "IDEMPOTENCY_KEY_CONFLICT",
                "Idempotency-Key가 다른 세션에서 이미 사용되었습니다.",
                { idempotencyKey, sessionId },
              );
            }

            const currentStep = await unwrap(
              deps.sessionRepository.getLastSnapshotStep(run.id),
            );

            return {
              statusCode: 201 as const,
              data: {
                runId: run.publicId,
                sessionId: session.publicId,
                status: run.status,
                isRecovery: false,
                currentStep,
              },
            };
          }
        }

        const existingRetry = await unwrap(
          deps.sessionRepository.findRunningRun(userId, session.id),
        );

        if (existingRetry) {
          const currentStep = await unwrap(
            deps.sessionRepository.getLastSnapshotStep(existingRetry.id),
          );

          return {
            statusCode: 200 as const,
            data: {
              runId: existingRetry.publicId,
              sessionId: session.publicId,
              status: "RUNNING" as const,
              isRecovery: true,
              currentStep,
            },
          };
        }

        throwAppError(createResult.error);
      }

      return {
        statusCode: 201 as const,
        data: {
          runId: createResult.value.publicId,
          sessionId: session.publicId,
          status: "RUNNING" as const,
          isRecovery: false,
          currentStep: 0,
        },
      };
    });
  };
}
