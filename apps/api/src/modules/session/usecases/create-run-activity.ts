import { tryPromise, unwrap } from "../../../lib/result";
import { isoDateTime } from "../../../lib/utils/date";
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
    return tryPromise(async () => {
      const now = new Date();

      const run = await unwrap(
        deps.sessionRepository.findRunByPublicId(userId, runId),
      );

      if (!run) {
        throw new ApiError(
          404,
          "SESSION_NOT_FOUND",
          "세션을 찾을 수 없습니다.",
          {
            runId,
          },
        );
      }

      if (run.status !== "RUNNING") {
        throw new ApiError(
          400,
          "INVALID_REQUEST",
          "진행 중인 세션이 아닙니다.",
          {
            status: run.status,
          },
        );
      }

      const inserted = await unwrap(
        deps.sessionRepository.insertActivity({
          sessionRunId: run.id,
          kind: input.kind,
          prompt: input.prompt,
          userAnswer: input.userAnswer ?? null,
          aiEvalJson: input.aiEvalJson ?? null,
          createdAt: now,
        }),
      );

      return CreateSessionActivityResponse.parse({
        data: { id: inserted.id, createdAt: isoDateTime(now) },
      });
    });
  };
}
