import { tryPromise, unwrap } from "../../../lib/result";
import { isoDateTime } from "../../../lib/utils/date";
import { ApiError } from "../../../middleware/error-handler";
import { CreateSessionCheckinResponse } from "../session.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  CreateSessionCheckinInput as CreateSessionCheckinInputType,
  CreateSessionCheckinResponse as CreateSessionCheckinResponseType,
} from "../session.dto";
import type { SessionRepository } from "../session.repository";

export function createRunCheckin(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function createRunCheckin(
    userId: string,
    runId: string,
    input: CreateSessionCheckinInputType,
  ): ResultAsync<CreateSessionCheckinResponseType, AppError> {
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
        deps.sessionRepository.insertCheckin({
          sessionRunId: run.id,
          kind: input.kind,
          prompt: input.prompt,
          responseJson: input.responseJson ?? null,
          recordedAt: now,
        }),
      );

      return CreateSessionCheckinResponse.parse({
        data: { id: inserted.id, recordedAt: isoDateTime(now) },
      });
    });
  };
}
