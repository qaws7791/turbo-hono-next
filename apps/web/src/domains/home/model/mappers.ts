import type { paths } from "~/foundation/types/api";
import type {
  HomeQueueConceptReviewItem,
  HomeQueueItem,
  HomeQueueSessionItem,
  SessionSummaryCard,
} from "./types";

import { todayIsoDate } from "~/foundation/lib/time";

type HomeQueueOk =
  paths["/api/home/queue"]["get"]["responses"]["200"]["content"]["application/json"];
type ApiQueueItem = HomeQueueOk["data"][number];

type SessionRunOk =
  paths["/api/session-runs"]["get"]["responses"]["200"]["content"]["application/json"];
type ApiSessionRun = SessionRunOk["data"][number];

export function mapSessionStatus(
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "CANCELED",
): "todo" | "in_progress" | "completed" {
  if (status === "IN_PROGRESS") return "in_progress";
  if (status === "COMPLETED") return "completed";
  return "todo";
}

export function mapSessionType(type: "LEARN" | "REVIEW"): "session" | "review" {
  return type === "REVIEW" ? "review" : "session";
}

export function isoDateFromMaybeDateTime(value: string | null): string {
  if (!value) return todayIsoDate();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return todayIsoDate();
  return date.toISOString().slice(0, 10);
}

export function toHomeQueueItem(item: ApiQueueItem): HomeQueueItem {
  if (item.kind === "SESSION") {
    const mapped: HomeQueueSessionItem = {
      href: `/session?sessionId=${encodeURIComponent(item.sessionId)}`,
      kind: "SESSION",
      sessionId: item.sessionId,
      spaceId: item.spaceId,
      spaceName: item.spaceName,
      planId: item.planId,
      planTitle: item.planTitle,
      moduleTitle: item.moduleTitle,
      sessionTitle: item.sessionTitle,
      type: mapSessionType(item.sessionType),
      status: mapSessionStatus(item.status),
      scheduledDate: todayIsoDate(),
      durationMinutes: item.estimatedMinutes,
      spaceIcon: item.spaceIcon,
      spaceColor: item.spaceColor,
    };
    return mapped;
  }

  const mapped: HomeQueueConceptReviewItem = {
    href: `/concept/${encodeURIComponent(item.conceptId)}`,
    kind: "CONCEPT_REVIEW",
    conceptId: item.conceptId,
    conceptTitle: item.conceptTitle,
    oneLiner: item.oneLiner,
    spaceId: item.spaceId,
    spaceName: item.spaceName,
    type: "review",
    scheduledDate: isoDateFromMaybeDateTime(item.dueAt),
    durationMinutes: item.estimatedMinutes,
    spaceIcon: item.spaceIcon,
    spaceColor: item.spaceColor,
  };
  return mapped;
}

export function toSessionSummaryCard(run: ApiSessionRun): SessionSummaryCard {
  return {
    sessionId: run.sessionId,
    planId: run.planId,
    spaceId: run.spaceId,
    moduleTitle: run.planTitle,
    sessionTitle: run.sessionTitle,
    completedAt: run.endedAt ?? run.startedAt,
    durationMinutes: run.durationMinutes,
    conceptCount:
      (run.summary?.conceptsCreatedCount ?? 0) +
      (run.summary?.conceptsUpdatedCount ?? 0),
  };
}
