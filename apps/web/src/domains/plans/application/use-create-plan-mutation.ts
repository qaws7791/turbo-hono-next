import * as React from "react";
import { useNavigate } from "react-router";

import { createPlanForUi } from "./plans";

import type { PlanGoal, PlanLevel } from "../model/types";

export type CreatePlanInput = {
  sourceMaterialIds: Array<string>;
  goal: PlanGoal;
  level: PlanLevel;
  durationMode: "custom" | "adaptive";
  durationValue?: number;
  durationUnit?: "days" | "weeks" | "months";
  notes?: string;
};

export function useCreatePlanMutation(spaceId: string): {
  isSubmitting: boolean;
  createPlan: (input: CreatePlanInput) => void;
} {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const createPlan = React.useCallback(
    async (input: CreatePlanInput) => {
      setIsSubmitting(true);
      try {
        const plan = await createPlanForUi(spaceId, input);
        navigate(`/spaces/${spaceId}/plan/${plan.id}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate, spaceId],
  );

  return { isSubmitting, createPlan };
}
