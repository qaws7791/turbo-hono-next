import { err, ok } from "neverthrow";

import { isoDateTime } from "../../../lib/utils/date";
import { ApiError } from "../../../middleware/error-handler";
import { ListSessionActivitiesResponse } from "../session.dto";
import { sessionRepository } from "../session.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { ListSessionActivitiesResponse as ListSessionActivitiesResponseType } from "../session.dto";

export async function listRunActivities(
  userId: string,
  runId: string,
): Promise<Result<ListSessionActivitiesResponseType, AppError>> {
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

  const rowsResult = await sessionRepository.listActivities(run.id);
  if (rowsResult.isErr()) return err(rowsResult.error);
  const rows = rowsResult.value;

  return ok(
    ListSessionActivitiesResponse.parse({
      data: rows.map((row) => ({
        id: row.id,
        kind: row.kind,
        prompt: row.prompt,
        userAnswer: row.userAnswer ?? null,
        aiEvalJson: row.aiEvalJson ?? null,
        createdAt: isoDateTime(row.createdAt),
      })),
    }),
  );
}
