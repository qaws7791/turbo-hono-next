import { err, ok, safeTry } from "neverthrow";

import { formatIsoDate, parseDateOnly } from "../../../../common/date";
import { coreError } from "../../../../common/core-error";
import { PlanSessionStatusSchema } from "../../api/schema";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type {
  PlanSessionStatus,
  UpdatePlanSessionInput,
  UpdatePlanSessionResponse,
} from "../../api/schema";
import type { SessionRepository } from "../infrastructure/session.repository";

const UpdatablePlanSessionStatusSchema = PlanSessionStatusSchema.extract([
  "SCHEDULED",
  "SKIPPED",
  "CANCELED",
]);

export function updatePlanSession(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function updatePlanSession(
    userId: string,
    sessionId: string,
    input: UpdatePlanSessionInput,
  ): ResultAsync<UpdatePlanSessionResponse, AppError> {
    return safeTry(async function* () {
      const now = new Date();

      if (!input.status && !input.scheduledForDate) {
        return err(
          coreError({
            code: "VALIDATION_ERROR",
            message: "변경할 값이 필요합니다.",
          }),
        );
      }

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

      if (session.status === "COMPLETED") {
        return err(
          coreError({
            code: "INVALID_REQUEST",
            message: "완료된 세션은 수정할 수 없습니다.",
            details: { sessionId, status: session.status },
          }),
        );
      }

      if (session.status === "IN_PROGRESS") {
        return err(
          coreError({
            code: "INVALID_REQUEST",
            message:
              "진행 중인 세션은 수정할 수 없습니다. 세션 런을 중단하거나 완료해주세요.",
            details: { sessionId, status: session.status },
          }),
        );
      }

      const nextStatus = yield* (() => {
        if (!input.status) return ok<PlanSessionStatus | undefined>(undefined);

        const statusParse = UpdatablePlanSessionStatusSchema.safeParse(
          input.status,
        );
        if (!statusParse.success) {
          return err(
            coreError({
              code: "VALIDATION_ERROR",
              message: "허용되지 않는 상태 값입니다.",
              details: { status: input.status },
            }),
          );
        }

        return ok<PlanSessionStatus | undefined>(statusParse.data);
      })();

      const nextScheduledForDate = input.scheduledForDate
        ? parseDateOnly(input.scheduledForDate)
        : undefined;

      const updated = yield* deps.sessionRepository.updatePlanSession({
        userId,
        sessionPublicId: sessionId,
        status: nextStatus,
        scheduledForDate: nextScheduledForDate,
        completedAt: null,
        now,
      });

      return ok({
        data: {
          sessionId: updated.sessionId,
          status: updated.status,
          scheduledForDate: formatIsoDate(updated.scheduledForDate),
        },
      });
    });
  };
}
