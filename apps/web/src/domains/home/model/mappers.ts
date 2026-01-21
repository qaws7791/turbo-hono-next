import type { paths } from "~/foundation/types/api";
import type {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function mapSessionType(_type: "LEARN"): "session" {
  return "session";
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
      planId: item.planId,
      planTitle: item.planTitle,
      planIcon: item.planIcon,
      planColor: item.planColor,
      moduleTitle: item.moduleTitle,
      sessionTitle: item.sessionTitle,
      type: mapSessionType(item.sessionType),
      status: mapSessionStatus(item.status),
      scheduledDate: todayIsoDate(),
      durationMinutes: item.estimatedMinutes,
    };
    return mapped;
  }

  // API가 SESSION 이외의 타입을 반환할 경우를 대비해 기본값 반환
  // 실제로는 타입 가드나 에러 처리가 더 적절할 수 있음
  throw new Error(`Unsupported queue item kind: ${item.kind}`);
}

export function toSessionSummaryCard(run: ApiSessionRun): SessionSummaryCard {
  return {
    sessionId: run.sessionId,
    planId: run.planId,
    moduleTitle: run.planTitle,
    sessionTitle: run.sessionTitle,
    completedAt: run.endedAt ?? run.startedAt,
    durationMinutes: run.durationMinutes,
  };
}
