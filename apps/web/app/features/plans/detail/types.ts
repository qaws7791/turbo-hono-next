import type { HomeQueueItem } from "~/mock/api";
import type { Plan, Space } from "~/mock/schemas";

export type PlanDetailData = {
  space: Space;
  plan: Plan & { progressPercent: number; totalSessions: number };
  nextQueue: Array<HomeQueueItem>;
};

