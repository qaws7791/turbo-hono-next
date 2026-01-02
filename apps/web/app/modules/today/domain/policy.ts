import type { HomeQueueItem } from "~/modules/home";

export type TodayStats = {
  totalCount: number;
  sessionCount: number;
  reviewCount: number;
};

export function getTodayStats(queue: ReadonlyArray<HomeQueueItem>): TodayStats {
  const totalCount = queue.length;
  const sessionCount = queue.filter((q) => q.sessionType === "LEARN").length;
  const reviewCount = queue.filter((q) => q.sessionType === "REVIEW").length;

  return { totalCount, sessionCount, reviewCount };
}
