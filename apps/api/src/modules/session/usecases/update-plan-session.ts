import { err, ok, safeTry } from "neverthrow";

import { parseDateOnly } from "../../../lib/utils/date";
import { parseOrInternalError } from "../../../lib/zod";
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
    return safeTry(async function* () {
      const now = new Date();

      if (!input.status && !input.scheduledForDate) {
        return err(
          new ApiError(400, "VALIDATION_ERROR", "변경할 값이 필요합니다."),
        );
      }

      const session = yield* deps.sessionRepository.findSessionForUpdate(
        userId,
        sessionId,
      );
      if (!session) {
        return err(
          new ApiError(404, "SESSION_NOT_FOUND", "세션을 찾을 수 없습니다.", {
            sessionId,
          }),
        );
      }

      if (session.status === "COMPLETED") {
        return err(
          new ApiError(
            400,
            "INVALID_REQUEST",
            "완료된 세션은 수정할 수 없습니다.",
            {
              sessionId,
              status: session.status,
            },
          ),
        );
      }

      if (session.status === "IN_PROGRESS") {
        return err(
          new ApiError(
            400,
            "INVALID_REQUEST",
            "진행 중인 세션은 수정할 수 없습니다. 세션 런을 중단하거나 완료해주세요.",
            { sessionId, status: session.status },
          ),
        );
      }

      const nextStatus = yield* (() => {
        if (!input.status) return ok<PlanSessionStatus | undefined>(undefined);

        const statusParse = UpdatablePlanSessionStatusSchema.safeParse(
          input.status,
        );
        if (!statusParse.success) {
          return err(
            new ApiError(
              400,
              "VALIDATION_ERROR",
              "허용되지 않는 상태 값입니다.",
              {
                status: input.status,
              },
            ),
          );
        }
        return ok<PlanSessionStatus | undefined>(statusParse.data);
      })();

      const nextScheduledForDate = input.scheduledForDate
        ? parseDateOnly(input.scheduledForDate)
        : undefined;

      const updated = yield* deps.sessionRepository.updatePlanSession({
        sessionInternalId: session.internalId,
        status: nextStatus,
        scheduledForDate: nextScheduledForDate,
        completedAt: null,
        now,
      });

      const response = yield* parseOrInternalError(
        UpdatePlanSessionResponse,
        {
          data: {
            sessionId: updated.publicId,
            status: updated.status,
            scheduledForDate: formatIsoDate(updated.scheduledForDate),
          },
        },
        "UpdatePlanSessionResponse",
      );

      return ok(response);
    });
  };
}
