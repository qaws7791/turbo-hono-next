import * as React from "react";
import { useNavigate, useRevalidator } from "react-router";

import { activatePlan, updatePlanStatus } from "../api";

export type PlanActionIntent = "set-active" | "pause" | "resume" | "archive";

export function usePlanStatusMutation(): {
  isSubmitting: boolean;
  executePlanAction: (planId: string, intent: PlanActionIntent) => void;
} {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const executePlanAction = React.useCallback(
    async (planId: string, intent: PlanActionIntent) => {
      setIsSubmitting(true);
      try {
        if (intent === "set-active") {
          await activatePlan(planId);
          navigate(`/plans/${planId}`);
          return;
        }

        if (intent === "pause") {
          await updatePlanStatus(planId, "PAUSED");
        } else if (intent === "resume") {
          await updatePlanStatus(planId, "ACTIVE");
        } else if (intent === "archive") {
          await updatePlanStatus(planId, "ARCHIVED");
          navigate(`/plans`);
          return;
        }

        revalidator.revalidate();
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate, revalidator],
  );

  return { isSubmitting, executePlanAction };
}
