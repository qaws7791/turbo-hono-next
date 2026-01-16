import { err, ok } from "neverthrow";

import { parseDateOnly } from "../../../lib/utils/date";
import { HomeQueueResponse } from "../session.dto";
import { sessionRepository } from "../session.repository";
import { computeStreakDays, generateCoachingMessage } from "../session.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { HomeQueueResponse as HomeQueueResponseType } from "../session.dto";

export async function getHomeQueue(
  userId: string,
): Promise<Result<HomeQueueResponseType, AppError>> {
  const today = parseDateOnly(new Date().toISOString().slice(0, 10));

  // 1. 홈 큐 데이터 조회
  const rowsResult = await sessionRepository.getHomeQueueRows(userId, today);
  if (rowsResult.isErr()) return err(rowsResult.error);
  const rows = rowsResult.value;

  // 2. Streak 계산을 위한 학습 날짜 조회
  const studyDatesResult = await sessionRepository.listDistinctStudyDates(
    userId,
    365,
  );
  if (studyDatesResult.isErr()) return err(studyDatesResult.error);
  const studyDates = studyDatesResult.value;

  const total = rows.length;
  const completed = rows.filter(
    (row) =>
      row.status === "COMPLETED" ||
      row.status === "SKIPPED" ||
      row.status === "CANCELED",
  ).length;

  const remainingCount = Math.max(0, total - completed);

  // 3. estimatedMinutes 계산 (미완료 항목만)
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

  // 4. Streak 및 coaching message 계산
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

  return ok(
    HomeQueueResponse.parse({
      data,
      summary: {
        total,
        completed,
        estimatedMinutes,
        coachingMessage,
        streakDays,
      },
    }),
  );
}
