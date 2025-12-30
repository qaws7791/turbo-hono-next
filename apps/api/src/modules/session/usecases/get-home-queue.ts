import { err, ok } from "neverthrow";

import { HomeQueueResponse } from "../session.dto";
import { sessionRepository } from "../session.repository";
import { parseDateOnly } from "../session.utils";

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

  const total = rows.length;
  const completed = rows.filter((row) => row.status === "COMPLETED").length;

  return ok(
    HomeQueueResponse.parse({
      data: rows
        .filter((row) => row.status !== "COMPLETED")
        .map((row) => ({
          sessionId: row.sessionId,
          spaceName: row.spaceName,
          planTitle: row.planTitle,
          moduleTitle: row.moduleTitle ?? "Module",
          sessionTitle: row.sessionTitle,
          sessionType: row.sessionType,
          estimatedMinutes: row.estimatedMinutes,
          status: row.status,
        })),
      summary: { total, completed },
    }),
  );
}
