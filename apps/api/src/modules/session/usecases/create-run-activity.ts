import { err, ok } from "neverthrow";

import { isoDateTime } from "../../../lib/utils/date";
import { ApiError } from "../../../middleware/error-handler";
import {
  CreateSessionActivityInput,
  CreateSessionActivityResponse,
} from "../session.dto";
import { sessionRepository } from "../session.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  CreateSessionActivityInput as CreateSessionActivityInputType,
  CreateSessionActivityResponse as CreateSessionActivityResponseType,
} from "../session.dto";

export async function createRunActivity(
  userId: string,
  runId: string,
  input: CreateSessionActivityInputType,
): Promise<Result<CreateSessionActivityResponseType, AppError>> {
  const now = new Date();

  const parseResult = CreateSessionActivityInput.safeParse(input);
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

  const insertResult = await sessionRepository.insertActivity({
    sessionRunId: run.id,
    kind: validated.kind,
    prompt: validated.prompt,
    userAnswer: validated.userAnswer ?? null,
    aiEvalJson: validated.aiEvalJson ?? null,
    createdAt: now,
  });
  if (insertResult.isErr()) return err(insertResult.error);

  return ok(
    CreateSessionActivityResponse.parse({
      data: { id: insertResult.value.id, createdAt: isoDateTime(now) },
    }),
  );
}
