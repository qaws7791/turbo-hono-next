import { err, ok, safeTry } from "neverthrow";

import { coreError } from "../../../../common/core-error";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { CreateSessionRunResult } from "../../api/schema";
import type { SessionRepository } from "../infrastructure/session.repository";

export function createOrRecoverRun(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function createOrRecoverRun(
    userId: string,
    sessionId: string,
    idempotencyKey?: string,
  ): ResultAsync<CreateSessionRunResult, AppError> {
    return safeTry(async function* () {
      const now = new Date();

      const session = yield* deps.sessionRepository.findSessionByPublicId(
        userId,
        sessionId,
      );
      if (!session) {
        return err(
          coreError({
            code: "SESSION_NOT_FOUND",
            message: "세션을 찾을 수 없습니다.",
            details: { sessionId },
          }),
        );
      }

      if (idempotencyKey) {
        const idempotentRun =
          yield* deps.sessionRepository.findRunByIdempotencyKey(
            userId,
            idempotencyKey,
          );

        if (idempotentRun) {
          if (idempotentRun.sessionId !== session.id) {
            return err(
              coreError({
                code: "IDEMPOTENCY_KEY_CONFLICT",
                message: "Idempotency-Key가 다른 세션에서 이미 사용되었습니다.",
                details: { idempotencyKey, sessionId },
              }),
            );
          }

          const currentStep = yield* deps.sessionRepository.getLastSnapshotStep(
            idempotentRun.id,
          );

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
          coreError({
            code: "SESSION_ALREADY_COMPLETED",
            message: "이미 완료된 세션입니다.",
          }),
        );
      }
      if (session.status === "SKIPPED" || session.status === "CANCELED") {
        return err(
          coreError({
            code: "INVALID_REQUEST",
            message:
              "건너뜀/취소된 세션은 시작할 수 없습니다. 다시 예정으로 변경해주세요.",
            details: { status: session.status },
          }),
        );
      }

      const existing = yield* deps.sessionRepository.findRunningRun(
        userId,
        session.id,
      );

      if (existing) {
        const currentStep = yield* deps.sessionRepository.getLastSnapshotStep(
          existing.id,
        );

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
          const run = yield* deps.sessionRepository.findRunByIdempotencyKey(
            userId,
            idempotencyKey,
          );

          if (run) {
            if (run.sessionId !== session.id) {
              return err(
                coreError({
                  code: "IDEMPOTENCY_KEY_CONFLICT",
                  message:
                    "Idempotency-Key가 다른 세션에서 이미 사용되었습니다.",
                  details: { idempotencyKey, sessionId },
                }),
              );
            }

            const currentStep =
              yield* deps.sessionRepository.getLastSnapshotStep(run.id);

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

        const existingRetry = yield* deps.sessionRepository.findRunningRun(
          userId,
          session.id,
        );

        if (existingRetry) {
          const currentStep = yield* deps.sessionRepository.getLastSnapshotStep(
            existingRetry.id,
          );

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

      return ok({
        statusCode: 201 as const,
        data: {
          runId: createResult.value.publicId,
          sessionId: session.publicId,
          status: "RUNNING" as const,
          isRecovery: false,
          currentStep: 0,
        },
      });
    });
  };
}
