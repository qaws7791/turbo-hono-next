import { queryOptions } from "@tanstack/react-query";

import {
  getHomeQueue,
  getHomeStats,
  getRecentSessions,
} from "./application/home";

import type {
  HomeQueueItem,
  HomeStats,
  SessionSummaryCard,
} from "./model/types";

export const homeQueries = {
  all: () => ["home"] as const,
  queue: () => [...homeQueries.all(), "queue"] as const,
  stats: () => [...homeQueries.all(), "stats"] as const,
  recent: () => [...homeQueries.all(), "recent"] as const,

  getQueue: () =>
    queryOptions({
      queryKey: homeQueries.queue(),
      queryFn: (): Promise<Array<HomeQueueItem>> => getHomeQueue(),
      staleTime: 10_000,
      gcTime: 60_000,
    }),

  getStats: () =>
    queryOptions({
      queryKey: homeQueries.stats(),
      queryFn: (): Promise<HomeStats> => getHomeStats(),
      staleTime: 10_000,
      gcTime: 60_000,
    }),

  getRecentSessions: (limit: number) =>
    queryOptions({
      queryKey: [...homeQueries.recent(), limit] as const,
      queryFn: (): Promise<Array<SessionSummaryCard>> =>
        getRecentSessions(limit),
      staleTime: 10_000,
      gcTime: 60_000,
    }),
};
