import { tryPromise, unwrap } from "../../../lib/result";
import { parseDateOnly } from "../../../lib/utils/date";
import { ApiError } from "../../../middleware/error-handler";
import {
  PlanSessionStatusSchema,
  UpdatePlanSessionResponse,
} from "../session.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  PlanSessionStatus,
  UpdatePlanSessionInput as UpdatePlanSessionInputType,
  UpdatePlanSessionResponse as UpdatePlanSessionResponseType,
} from "../session.dto";
import type { SessionRepository } from "../session.repository";

const UpdatablePlanSessionStatusSchema = PlanSessionStatusSchema.extract([
  "SCHEDULED",
  "SKIPPED",
  "CANCELED",
]);

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function updatePlanSession(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function updatePlanSession(
    userId: string,
    sessionId: string,
    input: UpdatePlanSessionInputType,
  ): ResultAsync<UpdatePlanSessionResponseType, AppError> {
    return tryPromise(async () => {
      const now = new Date();

      if (!input.status && !input.scheduledForDate) {
        throw new ApiError(400, "VALIDATION_ERROR", "변경할 값이 필요합니다.");
      }

      const session = await unwrap(
        deps.sessionRepository.findSessionForUpdate(userId, sessionId),
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

      if (session.status === "COMPLETED") {
        throw new ApiError(
          400,
          "INVALID_REQUEST",
          "완료된 세션은 수정할 수 없습니다.",
          {
            sessionId,
            status: session.status,
          },
        );
      }

      if (session.status === "IN_PROGRESS") {
        throw new ApiError(
          400,
          "INVALID_REQUEST",
          "진행 중인 세션은 수정할 수 없습니다. 세션 런을 중단하거나 완료해주세요.",
          { sessionId, status: session.status },
        );
      }

      let nextStatus: PlanSessionStatus | undefined;
      if (input.status) {
        const statusParse = UpdatablePlanSessionStatusSchema.safeParse(
          input.status,
        );
        if (!statusParse.success) {
          throw new ApiError(
            400,
            "VALIDATION_ERROR",
            "허용되지 않는 상태 값입니다.",
            {
              status: input.status,
            },
          );
        }
        nextStatus = statusParse.data;
      }

      const nextScheduledForDate = input.scheduledForDate
        ? parseDateOnly(input.scheduledForDate)
        : undefined;

      const updated = await unwrap(
        deps.sessionRepository.updatePlanSession({
          sessionInternalId: session.internalId,
          status: nextStatus,
          scheduledForDate: nextScheduledForDate,
          completedAt: null,
          now,
        }),
      );

      return UpdatePlanSessionResponse.parse({
        data: {
          sessionId: updated.publicId,
          status: updated.status,
          scheduledForDate: formatIsoDate(updated.scheduledForDate),
        },
      });
    });
  };
}
