import type { HomeQueueItem, HomeQueueSummary } from "./types";

export function getGreetingMessage(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) {
    return "좋은 아침입니다";
  }
  if (hour >= 12 && hour < 18) {
    return "좋은 오후입니다";
  }
  return "좋은 저녁입니다";
}

export function getRemainingCount(summary: HomeQueueSummary): number {
  return Math.max(0, summary.total - summary.completed);
}

export function getEstimatedMinutes(
  queue: ReadonlyArray<HomeQueueItem>,
): number {
  return queue.reduce((sum, item) => sum + item.estimatedMinutes, 0);
}
