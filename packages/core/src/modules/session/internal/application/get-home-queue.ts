import { ok, safeTry } from "neverthrow";

import { parseDateOnly } from "../../../../common/date";
import {
  computeStreakDays,
  generateCoachingMessage,
} from "../domain/session.utils";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { HomeQueueResponse } from "../../api/schema";
import type { SessionRepository } from "../infrastructure/session.repository";

export function getHomeQueue(deps: {
  readonly sessionRepository: SessionRepository;
}) {
  return function getHomeQueue(
    userId: string,
  ): ResultAsync<HomeQueueResponse, AppError> {
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

      const data: Array<HomeQueueResponse["data"][number]> = remainingRows.map(
        (row) => ({
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
        }),
      );

      return ok({
        data,
        summary: {
          total,
          completed,
          estimatedMinutes,
          coachingMessage,
          streakDays,
        },
      });
    });
  };
}
