import { apiClient } from "../client";
import { ApiError } from "../error";

import type { paths } from "~/foundation/types/api";

import { todayIsoDate } from "~/foundation/lib/time";
import { listSpacesForUi } from "~/foundation/api/compat/spaces";

export type HomeQueueItem = {
  href: string;
  kind: "SESSION" | "CONCEPT_REVIEW";
  sessionId: string;
  spaceId: string;
  spaceName: string;
  planId: string;
  planTitle: string;
  moduleTitle: string;
  sessionTitle: string;
  type: "session" | "review";
  status: "todo" | "in_progress" | "completed";
  scheduledDate: string;
  durationMinutes: number;
  spaceIcon: string;
  spaceColor: string;
};

export type HomeStats = {
  coachingMessage: string;
  remainingCount: number;
  completedCountToday: number;
  estimatedMinutes: number;
  streakDays: number;
};

export type SessionSummaryCard = {
  sessionId: string;
  planId: string;
  spaceId: string;
  moduleTitle: string;
  sessionTitle: string;
  completedAt: string;
  durationMinutes: number;
  conceptCount: number;
};

type HomeQueueOk =
  paths["/api/home/queue"]["get"]["responses"]["200"]["content"]["application/json"];
type ApiQueueItem = HomeQueueOk["data"][number];

function mapSessionStatus(
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "CANCELED",
): "todo" | "in_progress" | "completed" {
  if (status === "IN_PROGRESS") return "in_progress";
  if (status === "COMPLETED") return "completed";
  return "todo";
}

function mapSessionType(type: "LEARN" | "REVIEW"): "session" | "review" {
  return type === "REVIEW" ? "review" : "session";
}

function isoDateFromMaybeDateTime(value: string | null): string {
  if (!value) return todayIsoDate();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return todayIsoDate();
  return date.toISOString().slice(0, 10);
}

async function getHomeQueueApi(): Promise<{
  items: Array<ApiQueueItem>;
  summary: HomeQueueOk["summary"];
}> {
  const { data, error, response } = await apiClient.GET("/api/home/queue");
  if (!response.ok || !data) {
    throw new ApiError("Failed to fetch home queue", response.status, error);
  }
  return { items: data.data, summary: data.summary };
}

export async function homeQueue(): Promise<Array<HomeQueueItem>> {
  const [{ items }, spaces] = await Promise.all([
    getHomeQueueApi(),
    listSpacesForUi(),
  ]);

  const byId = new Map(spaces.map((s) => [s.id, s]));
  const byName = new Map(spaces.map((s) => [s.name, s]));

  return items.map((item) => {
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
  });
}

export async function statsForHome(): Promise<HomeStats> {
  const { items, summary } = await getHomeQueueApi();

  const estimatedMinutes = items.reduce((acc, item) => {
    if (item.kind === "SESSION") {
      if (item.status === "COMPLETED") return acc;
      return acc + item.estimatedMinutes;
    }
    return acc + item.estimatedMinutes;
  }, 0);

  const remainingCount = Math.max(0, summary.total - summary.completed);
  const coachingMessage =
    remainingCount === 0
      ? "오늘 할 일을 모두 끝냈어요. 잘했어요!"
      : remainingCount <= 2
        ? "조금만 더 하면 오늘 목표를 달성할 수 있어요."
        : "오늘 할 일부터 차근차근 진행해보세요.";

  return {
    coachingMessage,
    remainingCount,
    completedCountToday: summary.completed,
    estimatedMinutes,
    streakDays: 0,
  };
}

export async function recentSessions(
  limit: number,
): Promise<Array<SessionSummaryCard>> {
  const { data, error, response } = await apiClient.GET("/api/session-runs", {
    params: { query: { limit, status: "COMPLETED" } },
  });
  if (!response.ok || !data) {
    throw new ApiError(
      "Failed to fetch recent session runs",
      response.status,
      error,
    );
  }

  return data.data.map((run) => ({
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
  }));
}
