import { err, ok, safeTry } from "neverthrow";

import { isoDateTime } from "../../../lib/utils/date";
import { parseOrInternalError } from "../../../lib/zod";
import { ApiError } from "../../../middleware/error-handler";
import { UpdateSessionRunProgressResponse } from "../session.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  UpdateSessionRunProgressInput as UpdateSessionRunProgressInputType,
  UpdateSessionRunProgressResponse as UpdateSessionRunProgressResponseType,
} from "../session.dto";
import type { SessionRepository } from "../session.repository";

export function saveProgress(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function saveProgress(
    userId: string,
    runId: string,
    input: UpdateSessionRunProgressInputType,
  ): ResultAsync<UpdateSessionRunProgressResponseType, AppError> {
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

      yield* deps.sessionRepository.insertProgressSnapshot({
        sessionRunId: run.id,
        stepIndex: input.stepIndex,
        payloadJson: input.inputs,
        createdAt: now,
      });

      const response = yield* parseOrInternalError(
        UpdateSessionRunProgressResponse,
        {
          data: { runId: run.publicId, savedAt: isoDateTime(now) },
        },
        "UpdateSessionRunProgressResponse",
      );

      return ok(response);
    });
  };
}
