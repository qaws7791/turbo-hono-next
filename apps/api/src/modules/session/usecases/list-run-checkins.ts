import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { ListSessionCheckinsResponse } from "../session.dto";
import { sessionRepository } from "../session.repository";
import { isoDateTime } from "../session.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { ListSessionCheckinsResponse as ListSessionCheckinsResponseType } from "../session.dto";

export async function listRunCheckins(
  userId: string,
  runId: string,
): Promise<Result<ListSessionCheckinsResponseType, AppError>> {
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

  const rowsResult = await sessionRepository.listCheckins(run.id);
  if (rowsResult.isErr()) return err(rowsResult.error);
  const rows = rowsResult.value;

  return ok(
    ListSessionCheckinsResponse.parse({
      data: rows.map((row) => ({
        id: row.id,
        kind: row.kind,
        prompt: row.prompt,
        responseJson: row.responseJson ?? null,
        recordedAt: isoDateTime(row.recordedAt),
      })),
    }),
  );
}
