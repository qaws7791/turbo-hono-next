import { useFetcher } from "react-router";

import type { HomeQueueItem, listPlans } from "~/mock/api";
import type { Plan } from "~/mock/schemas";

export type SpacePlansModel = {
  isSubmitting: boolean;
  fetcher: ReturnType<typeof useFetcher>;
  plans: ReturnType<typeof listPlans>;
  nextSession: HomeQueueItem | undefined;
  activePlan:
    | (Plan & { progressPercent: number; totalSessions: number })
    | null;
};

export function useSpacePlansModel(input: {
  plans: ReturnType<typeof listPlans>;
  nextQueue: Array<HomeQueueItem>;
  activePlan:
    | (Plan & { progressPercent: number; totalSessions: number })
    | null;
}): SpacePlansModel {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";

  return {
    isSubmitting,
    fetcher,
    plans: input.plans,
    nextSession: input.nextQueue[0],
    activePlan: input.activePlan,
  };
}
