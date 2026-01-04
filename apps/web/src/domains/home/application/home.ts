import { toHomeQueueItem, toSessionSummaryCard } from "../model/mappers";

import type { paths } from "~/foundation/types/api";
import type {
  HomeQueueItem,
  HomeStats,
  SessionSummaryCard,
} from "../model/types";

import { listSpacesForUi } from "~/domains/spaces";
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

export async function getHomeQueue(): Promise<Array<HomeQueueItem>> {
  const [{ items }, spaces] = await Promise.all([
    getHomeQueueApi(),
    listSpacesForUi(),
  ]);

  return items.map((item) => toHomeQueueItem(item, spaces));
}

export async function getHomeStats(): Promise<HomeStats> {
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
