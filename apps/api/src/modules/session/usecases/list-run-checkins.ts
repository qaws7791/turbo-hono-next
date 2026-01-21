import { err, ok, safeTry } from "neverthrow";

import { isoDateTime } from "../../../lib/utils/date";
import { parseOrInternalError } from "../../../lib/zod";
import { ApiError } from "../../../middleware/error-handler";
import { ListSessionCheckinsResponse } from "../session.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { ListSessionCheckinsResponse as ListSessionCheckinsResponseType } from "../session.dto";
import type { SessionRepository } from "../session.repository";

export function listRunCheckins(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function listRunCheckins(
    userId: string,
    runId: string,
  ): ResultAsync<ListSessionCheckinsResponseType, AppError> {
    return safeTry(async function* () {
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

      const rows = yield* deps.sessionRepository.listCheckins(run.id);

      const response = yield* parseOrInternalError(
        ListSessionCheckinsResponse,
        {
          data: rows.map((row) => ({
            id: row.id,
            kind: row.kind,
            prompt: row.prompt,
            responseJson: row.responseJson ?? null,
            recordedAt: isoDateTime(row.recordedAt),
          })),
        },
        "ListSessionCheckinsResponse",
      );

      return ok(response);
    });
  };
}
