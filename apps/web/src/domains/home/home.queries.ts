import { queryOptions } from "@tanstack/react-query";

import {
  getHomeQueue,
  getHomeStats,
  getRecentSessions,
} from "./application/home";

import type {
  HomeQueue, // Added HomeQueueItem to imports
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
      queryFn: (): Promise<HomeQueue> => getHomeQueue(),
    }),

  getStats: () =>
    queryOptions({
      queryKey: homeQueries.stats(),
      queryFn: (): Promise<HomeStats> => getHomeStats(),
    }),

  getRecentSessions: (limit: number) =>
    queryOptions({
      queryKey: [...homeQueries.recent(), limit] as const,
      queryFn: (): Promise<Array<SessionSummaryCard>> =>
        getRecentSessions(limit),
    }),
};
