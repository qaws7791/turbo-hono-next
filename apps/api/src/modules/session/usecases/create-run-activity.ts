import { err, ok, safeTry } from "neverthrow";

import { isoDateTime } from "../../../lib/utils/date";
import { parseOrInternalError } from "../../../lib/zod";
import { ApiError } from "../../../middleware/error-handler";
import { CreateSessionActivityResponse } from "../session.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  CreateSessionActivityInput as CreateSessionActivityInputType,
  CreateSessionActivityResponse as CreateSessionActivityResponseType,
} from "../session.dto";
import type { SessionRepository } from "../session.repository";

export function createRunActivity(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function createRunActivity(
    userId: string,
    runId: string,
    input: CreateSessionActivityInputType,
  ): ResultAsync<CreateSessionActivityResponseType, AppError> {
    return safeTry(async function* () {
      const now = new Date();

      const run = yield* deps.sessionRepository.findRunByPublicId(
        userId,
        runId,
      );
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

      const inserted = yield* deps.sessionRepository.insertActivity({
        sessionRunId: run.id,
        kind: input.kind,
        prompt: input.prompt,
        userAnswer: input.userAnswer ?? null,
        aiEvalJson: input.aiEvalJson ?? null,
        createdAt: now,
      });

      const response = yield* parseOrInternalError(
        CreateSessionActivityResponse,
        {
          data: { id: inserted.id, createdAt: isoDateTime(now) },
        },
        "CreateSessionActivityResponse",
      );

      return ok(response);
    });
  };
}
