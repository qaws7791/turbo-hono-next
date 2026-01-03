import type { HomeQueueItem } from "~/api/compat/home";
import type { Document, Plan, Space } from "~/mock/schemas";

export type PlanDetailData = {
  space: Space;
  plan: Plan & { progressPercent: number; totalSessions: number };
  nextQueue: Array<HomeQueueItem>;
  sourceDocuments: Array<Document>;
};
