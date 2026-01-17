import { tryPromise, unwrap } from "../../../lib/result";
import { isoDateTime } from "../../../lib/utils/date";
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
    return tryPromise(async () => {
      const now = new Date();

      // 1. Run 조회
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

      // 2. 진행 상황 스냅샷 저장
      await unwrap(
        deps.sessionRepository.insertProgressSnapshot({
          sessionRunId: run.id,
          stepIndex: input.stepIndex,
          payloadJson: input.inputs,
          createdAt: now,
        }),
      );

      return UpdateSessionRunProgressResponse.parse({
        data: { runId: run.publicId, savedAt: isoDateTime(now) },
      });
    });
  };
}
