import { err, ok } from "neverthrow";

import { isoDateTime } from "../../../lib/utils/date";
import { ApiError } from "../../../middleware/error-handler";
import {
  UpdateSessionRunProgressInput,
  UpdateSessionRunProgressResponse,
} from "../session.dto";
import { sessionRepository } from "../session.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  UpdateSessionRunProgressInput as UpdateSessionRunProgressInputType,
  UpdateSessionRunProgressResponse as UpdateSessionRunProgressResponseType,
} from "../session.dto";

export async function saveProgress(
  userId: string,
  runId: string,
  input: UpdateSessionRunProgressInputType,
): Promise<Result<UpdateSessionRunProgressResponseType, AppError>> {
  const now = new Date();

  // 1. 입력 검증
  const parseResult = UpdateSessionRunProgressInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

  // 2. Run 조회
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

  // 3. 진행 상황 스냅샷 저장
  const insertResult = await sessionRepository.insertProgressSnapshot({
    sessionRunId: run.id,
    stepIndex: validated.stepIndex,
    payloadJson: validated.inputs as Record<string, unknown>,
    createdAt: now,
  });
  if (insertResult.isErr()) return err(insertResult.error);

  return ok(
    UpdateSessionRunProgressResponse.parse({
      data: { runId: run.publicId, savedAt: isoDateTime(now) },
    }),
  );
}
