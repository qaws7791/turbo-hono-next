import { useFetcher } from "react-router";

import type { HomeQueueItem } from "~/foundation/api/compat/home";
import type { Plan } from "~/app/mocks/schemas";

export type PlanDetailModel = {
  canStart: boolean;
  isSubmitting: boolean;
  nextSession: HomeQueueItem | undefined;
  fetcher: ReturnType<typeof useFetcher>;
};

export function usePlanDetailModel(input: {
  plan: Plan & { progressPercent: number; totalSessions: number };
  nextQueue: Array<HomeQueueItem>;
}): PlanDetailModel {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";
  const nextSession = input.nextQueue[0];
  const canStart = input.plan.status === "active" && Boolean(nextSession);

  return { canStart, isSubmitting, nextSession, fetcher };
}
