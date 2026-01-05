import { useFetcher } from "react-router";

import type { PlanWithDerived } from "../model";

export type PlanDetailModel = {
  canStart: boolean;
  isSubmitting: boolean;
  nextSession: { href: string } | undefined;
  fetcher: ReturnType<typeof useFetcher>;
};

export function usePlanDetailModel(input: {
  plan: PlanWithDerived;
  nextQueue: Array<{ href: string }>;
}): PlanDetailModel {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";
  const nextSession = input.nextQueue[0];
  const canStart = input.plan.status === "active" && Boolean(nextSession);

  return { canStart, isSubmitting, nextSession, fetcher };
}
