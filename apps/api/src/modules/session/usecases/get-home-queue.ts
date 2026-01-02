import { err, ok } from "neverthrow";

import { HomeQueueResponse } from "../session.dto";
import { sessionRepository } from "../session.repository";
import { addDays, parseDateOnly } from "../session.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { HomeQueueResponse as HomeQueueResponseType } from "../session.dto";

export async function getHomeQueue(
  userId: string,
): Promise<Result<HomeQueueResponseType, AppError>> {
  const today = parseDateOnly(new Date().toISOString().slice(0, 10));
  const dueWindowEnd = addDays(today, 3);

  // 1. 홈 큐 데이터 조회
  const rowsResult = await sessionRepository.getHomeQueueRows(userId, today);
  if (rowsResult.isErr()) return err(rowsResult.error);
  const rows = rowsResult.value;

  const reviewedConceptIdsResult =
    await sessionRepository.listReviewedConceptIdsToday(userId, today);
  if (reviewedConceptIdsResult.isErr())
    return err(reviewedConceptIdsResult.error);
  const reviewedConceptIds = reviewedConceptIdsResult.value;

  const dueConceptsResult = await sessionRepository.listDueConceptReviews(
    userId,
    dueWindowEnd,
    reviewedConceptIds,
  );
  if (dueConceptsResult.isErr()) return err(dueConceptsResult.error);
  const dueConcepts = dueConceptsResult.value;

  const reviewedConceptsCountResult =
    await sessionRepository.countReviewedConceptsToday(userId, today);
  if (reviewedConceptsCountResult.isErr())
    return err(reviewedConceptsCountResult.error);
  const reviewedConceptsCount = Number(reviewedConceptsCountResult.value);

  const sessionTotal = rows.length;
  const sessionCompleted = rows.filter(
    (row) =>
      row.status === "COMPLETED" ||
      row.status === "SKIPPED" ||
      row.status === "CANCELED",
  ).length;

  const conceptTotal = dueConcepts.length + reviewedConceptsCount;
  const conceptCompleted = reviewedConceptsCount;

  const total = Number(sessionTotal + conceptTotal);
  const completed = Number(sessionCompleted + conceptCompleted);

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
      spaceName: row.spaceName,
      planTitle: row.planTitle,
      moduleTitle: row.moduleTitle ?? "Module",
      sessionTitle: row.sessionTitle,
      sessionType: row.sessionType,
      estimatedMinutes: row.estimatedMinutes,
      status: row.status,
    });
  }

  for (const concept of dueConcepts) {
    data.push({
      kind: "CONCEPT_REVIEW",
      conceptId: concept.conceptId,
      conceptTitle: concept.conceptTitle,
      oneLiner: concept.oneLiner,
      spaceId: concept.spaceId,
      spaceName: concept.spaceName,
      sessionType: "REVIEW",
      estimatedMinutes: 5,
      reviewStatus:
        concept.dueAt && concept.dueAt.getTime() < today.getTime()
          ? "OVERDUE"
          : "DUE",
      dueAt: concept.dueAt ? concept.dueAt.toISOString() : null,
    });
  }

  return ok(
    HomeQueueResponse.parse({
      data,
      summary: { total, completed },
    }),
  );
}
