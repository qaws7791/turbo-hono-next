import type { HomeQueueItem } from "~/foundation/api/compat/home";
import type { Document, Plan, Space } from "~/app/mocks/schemas";

export type PlanDetailData = {
  space: Space;
  plan: Plan & { progressPercent: number; totalSessions: number };
  nextQueue: Array<HomeQueueItem>;
  sourceDocuments: Array<Document>;
};
