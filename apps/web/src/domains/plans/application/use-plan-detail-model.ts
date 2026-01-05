import { usePlanStatusMutation } from "./use-plan-status-mutation";

import type { PlanWithDerived } from "../model";
import type { PlanActionIntent } from "./use-plan-status-mutation";

export type PlanDetailModel = {
  canStart: boolean;
  isSubmitting: boolean;
  nextSession: { href: string } | undefined;
  executePlanAction: (planId: string, intent: PlanActionIntent) => void;
};

export function usePlanDetailModel(input: {
  plan: PlanWithDerived;
  nextQueue: Array<{ href: string }>;
  spaceId: string;
}): PlanDetailModel {
  const { isSubmitting, executePlanAction } = usePlanStatusMutation(
    input.spaceId,
  );
  const nextSession = input.nextQueue[0];
  const canStart = input.plan.status === "active" && Boolean(nextSession);

  return { canStart, isSubmitting, nextSession, executePlanAction };
}
