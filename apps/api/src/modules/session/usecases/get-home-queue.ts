import { tryPromise, unwrap } from "../../../lib/result";
import { parseDateOnly } from "../../../lib/utils/date";
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
    return tryPromise(async () => {
      const today = parseDateOnly(new Date().toISOString().slice(0, 10));

      const rows = await unwrap(
        deps.sessionRepository.getHomeQueueRows(userId, today),
      );

      const studyDates = await unwrap(
        deps.sessionRepository.listDistinctStudyDates(userId, 365),
      );

      const total = rows.length;
      const completed = rows.filter(
        (row) =>
          row.status === "COMPLETED" ||
          row.status === "SKIPPED" ||
          row.status === "CANCELED",
      ).length;

      const remainingCount = Math.max(0, total - completed);

      let estimatedMinutes = 0;
      for (const row of rows) {
        if (
          row.status !== "COMPLETED" &&
          row.status !== "SKIPPED" &&
          row.status !== "CANCELED"
        ) {
          estimatedMinutes += row.estimatedMinutes;
        }
      }

      const streakDays = computeStreakDays(studyDates, today);
      const coachingMessage = generateCoachingMessage(remainingCount);

      const data: Array<HomeQueueResponseType["data"][number]> = [];

      for (const row of rows) {
        if (
          row.status === "COMPLETED" ||
          row.status === "SKIPPED" ||
          row.status === "CANCELED"
        ) {
          continue;
        }
        data.push({
          kind: "SESSION",
          sessionId: row.sessionId,
          planId: row.planId,
          planTitle: row.planTitle,
          planIcon: row.planIcon ?? "book",
          planColor: row.planColor ?? "blue",
          moduleTitle: row.moduleTitle ?? "Module",
          sessionTitle: row.sessionTitle,
          sessionType: row.sessionType,
          estimatedMinutes: row.estimatedMinutes,
          status: row.status,
        });
      }

      return HomeQueueResponse.parse({
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
