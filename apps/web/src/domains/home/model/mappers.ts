import type { paths } from "~/foundation/types/api";
import type { Space } from "../../spaces/model/types";
import type { HomeQueueItem, SessionSummaryCard } from "./types";

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

export function toHomeQueueItem(
  item: ApiQueueItem,
  spaces: Array<Space>,
): HomeQueueItem {
  const byId = new Map(spaces.map((s) => [s.id, s]));
  const byName = new Map(spaces.map((s) => [s.name, s]));

  if (item.kind === "SESSION") {
    const space = byName.get(item.spaceName);
    return {
      href: `/session?sessionId=${encodeURIComponent(item.sessionId)}`,
      kind: "SESSION",
      sessionId: item.sessionId,
      spaceId: space?.id ?? "",
      spaceName: item.spaceName,
      planId: "",
      planTitle: item.planTitle,
      moduleTitle: item.moduleTitle,
      sessionTitle: item.sessionTitle,
      type: mapSessionType(item.sessionType),
      status: mapSessionStatus(item.status),
      scheduledDate: todayIsoDate(),
      durationMinutes: item.estimatedMinutes,
      spaceIcon: space?.icon ?? "book",
      spaceColor: space?.color ?? "blue",
    };
  }

  const space = byId.get(item.spaceId);
  return {
    href: `/concept/${encodeURIComponent(item.conceptId)}`,
    kind: "CONCEPT_REVIEW",
    sessionId: item.conceptId,
    spaceId: item.spaceId,
    spaceName: item.spaceName,
    planId: "",
    planTitle: "개념 복습",
    moduleTitle: "복습",
    sessionTitle: item.conceptTitle,
    type: "review",
    status: "todo",
    scheduledDate: isoDateFromMaybeDateTime(item.dueAt),
    durationMinutes: item.estimatedMinutes,
    spaceIcon: space?.icon ?? "book",
    spaceColor: space?.color ?? "blue",
  };
}

export function toSessionSummaryCard(run: ApiSessionRun): SessionSummaryCard {
  return {
    sessionId: run.sessionId,
    planId: run.planId,
    spaceId: run.spaceId,
    moduleTitle: run.planTitle,
    sessionTitle: run.sessionTitle,
    completedAt: run.endedAt ?? run.startedAt,
    durationMinutes: 0,
    conceptCount:
      (run.summary?.conceptsCreatedCount ?? 0) +
      (run.summary?.conceptsUpdatedCount ?? 0),
  };
}
