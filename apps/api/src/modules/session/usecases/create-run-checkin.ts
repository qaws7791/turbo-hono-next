import { err, ok } from "neverthrow";

import { isoDateTime } from "../../../lib/utils/date";
import { ApiError } from "../../../middleware/error-handler";
import {
  CreateSessionCheckinInput,
  CreateSessionCheckinResponse,
} from "../session.dto";
import { sessionRepository } from "../session.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  CreateSessionCheckinInput as CreateSessionCheckinInputType,
  CreateSessionCheckinResponse as CreateSessionCheckinResponseType,
} from "../session.dto";

export async function createRunCheckin(
  userId: string,
  runId: string,
  input: CreateSessionCheckinInputType,
): Promise<Result<CreateSessionCheckinResponseType, AppError>> {
  const now = new Date();

  const parseResult = CreateSessionCheckinInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

  const runResult = await sessionRepository.findRunByPublicId(userId, runId);
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

  const insertResult = await sessionRepository.insertCheckin({
    sessionRunId: run.id,
    kind: validated.kind,
    prompt: validated.prompt,
    responseJson: validated.responseJson ?? null,
    recordedAt: now,
  });
  if (insertResult.isErr()) return err(insertResult.error);

  return ok(
    CreateSessionCheckinResponse.parse({
      data: { id: insertResult.value.id, recordedAt: isoDateTime(now) },
    }),
  );
}
