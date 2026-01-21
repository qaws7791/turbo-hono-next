import { ok, safeTry } from "neverthrow";

import { parseDateOnly } from "../../../lib/utils/date";
import { parseOrInternalError } from "../../../lib/zod";
import { HomeQueueResponse } from "../session.dto";
import { computeStreakDays, generateCoachingMessage } from "../session.utils";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { HomeQueueResponse as HomeQueueResponseType } from "../session.dto";
import type { SessionRepository } from "../session.repository";

export function getHomeQueue(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function getHomeQueue(
    userId: string,
  ): ResultAsync<HomeQueueResponseType, AppError> {
    return safeTry(async function* () {
      const today = parseDateOnly(new Date().toISOString().slice(0, 10));

      const rows = yield* deps.sessionRepository.getHomeQueueRows(
        userId,
        today,
      );
      const studyDates = yield* deps.sessionRepository.listDistinctStudyDates(
        userId,
        365,
      );

      const total = rows.length;
      const isDone = (status: string) =>
        status === "COMPLETED" || status === "SKIPPED" || status === "CANCELED";

      const completed = rows.filter((row) => isDone(row.status)).length;

      const remainingCount = Math.max(0, total - completed);

      const remainingRows = rows.filter((row) => !isDone(row.status));
      const estimatedMinutes = remainingRows.reduce(
        (sum, row) => sum + row.estimatedMinutes,
        0,
      );

      const streakDays = computeStreakDays(studyDates, today);
      const coachingMessage = generateCoachingMessage(remainingCount);

      const data: Array<HomeQueueResponseType["data"][number]> =
        remainingRows.map((row) => ({
          kind: "SESSION",
          sessionId: row.sessionId,
          planId: row.planId,
          planTitle: row.planTitle,
          planIcon: row.planIcon,
          planColor: row.planColor,
          moduleTitle: row.moduleTitle,
          sessionTitle: row.sessionTitle,
          sessionType: row.sessionType,
          estimatedMinutes: row.estimatedMinutes,
          status: row.status,
        }));

      const response = yield* parseOrInternalError(
        HomeQueueResponse,
        {
          data,
          summary: {
            total,
            completed,
            estimatedMinutes,
            coachingMessage,
            streakDays,
          },
        },
        "HomeQueueResponse",
      );

      return ok(response);
    });
  };
}
