import { usePlanStatusMutation } from "./use-plan-status-mutation";

import type { PlanActionIntent } from "./use-plan-status-mutation";

export type PlanActions = {
  isSubmitting: boolean;
  executePlanAction: (planId: string, intent: PlanActionIntent) => void;
};

export function usePlanActions(spaceId: string): PlanActions {
  const { isSubmitting, executePlanAction } = usePlanStatusMutation(spaceId);

  return { isSubmitting, executePlanAction };
}
