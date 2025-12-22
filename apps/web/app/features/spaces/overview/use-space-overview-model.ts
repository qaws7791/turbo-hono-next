import type { HomeQueueItem } from "~/mock/api";
import type { Document, Plan } from "~/mock/schemas";

export type SpaceOverviewModel = {
  nextSession: HomeQueueItem | undefined;
  latestDocument: Document | null;
  activePlan: (Plan & { progressPercent: number; totalSessions: number }) | null;
};

export function useSpaceOverviewModel(input: {
  nextQueue: Array<HomeQueueItem>;
  activePlan: (Plan & { progressPercent: number; totalSessions: number }) | null;
  latestDocument: Document | null;
}): SpaceOverviewModel {
  return {
    nextSession: input.nextQueue[0],
    latestDocument: input.latestDocument,
    activePlan: input.activePlan,
  };
}

