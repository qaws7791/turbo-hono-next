import { toHomeQueueItem, toSessionSummaryCard } from "../model/mappers";

import type { paths } from "~/foundation/types/api";
import type { HomeQueue, HomeStats, SessionSummaryCard } from "../model/types";

import { apiClient } from "~/foundation/api/client";
import { ApiError } from "~/foundation/api/error";

type HomeQueueOk =
  paths["/api/home/queue"]["get"]["responses"]["200"]["content"]["application/json"];

async function getHomeQueueApi(): Promise<{
  items: HomeQueueOk["data"];
  summary: HomeQueueOk["summary"];
}> {
  const { data, error, response } = await apiClient.GET("/api/home/queue");
  if (!response.ok || !data) {
    throw new ApiError("Failed to fetch home queue", response.status, error);
  }
  return { items: data.data, summary: data.summary };
}

export async function getHomeQueue(): Promise<HomeQueue> {
  const { items, summary } = await getHomeQueueApi();

  return {
    items: items.map((item) => toHomeQueueItem(item)),
    summary: {
      total: summary.total,
      completed: summary.completed,
    },
  };
}

export async function getHomeStats(): Promise<HomeStats> {
  const { summary } = await getHomeQueueApi();

  return {
    coachingMessage: summary.coachingMessage,
    remainingCount: Math.max(0, summary.total - summary.completed),
    completedCountToday: summary.completed,
    estimatedMinutes: summary.estimatedMinutes,
    streakDays: summary.streakDays,
  };
}

export async function getRecentSessions(
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

  return data.data.map(toSessionSummaryCard);
}
