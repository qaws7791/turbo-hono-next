import { err, ok } from "neverthrow";

import { parseDateOnly } from "../../../lib/utils/date";
import { ApiError } from "../../../middleware/error-handler";
import {
  PlanSessionStatusSchema,
  UpdatePlanSessionInput,
  UpdatePlanSessionResponse,
} from "../session.dto";
import { sessionRepository } from "../session.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  PlanSessionStatus,
  UpdatePlanSessionInput as UpdatePlanSessionInputType,
  UpdatePlanSessionResponse as UpdatePlanSessionResponseType,
} from "../session.dto";

const UpdatablePlanSessionStatusSchema = PlanSessionStatusSchema.extract([
  "SCHEDULED",
  "SKIPPED",
  "CANCELED",
]);

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function updatePlanSession(
  userId: string,
  sessionId: string,
  input: UpdatePlanSessionInputType,
): Promise<Result<UpdatePlanSessionResponseType, AppError>> {
  const now = new Date();

  const parseResult = UpdatePlanSessionInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

  if (!validated.status && !validated.scheduledForDate) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", "변경할 값이 필요합니다."),
    );
  }

  const sessionResult = await sessionRepository.findSessionForUpdate(
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

  let nextStatus: PlanSessionStatus | undefined;
  if (validated.status) {
    const statusParse = UpdatablePlanSessionStatusSchema.safeParse(
      validated.status,
    );
    if (!statusParse.success) {
      return err(
        new ApiError(400, "VALIDATION_ERROR", "허용되지 않는 상태 값입니다.", {
          status: validated.status,
        }),
      );
    }
    nextStatus = statusParse.data;
  }

  const nextScheduledForDate = validated.scheduledForDate
    ? parseDateOnly(validated.scheduledForDate)
    : undefined;

  const updateResult = await sessionRepository.updatePlanSession({
    sessionInternalId: session.internalId,
    status: nextStatus,
    scheduledForDate: nextScheduledForDate,
    completedAt: null,
    now,
  });
  if (updateResult.isErr()) return err(updateResult.error);
  const updated = updateResult.value;

  return ok(
    UpdatePlanSessionResponse.parse({
      data: {
        sessionId: updated.publicId,
        status: updated.status,
        scheduledForDate: formatIsoDate(updated.scheduledForDate),
      },
    }),
  );
}
