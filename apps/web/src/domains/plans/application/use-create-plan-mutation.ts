import * as React from "react";
import { useNavigate } from "react-router";

import { createPlan as createPlanApi } from "../api";

export type CreatePlanInput = {
  sourceMaterialIds: Array<string>;
  durationMode: "custom" | "adaptive";
  durationValue?: number;
  durationUnit?: "days" | "weeks" | "months";
  notes?: string;
};

function computeTargetDueDate(input: {
  durationMode: "custom" | "adaptive";
  durationValue?: number;
  durationUnit?: "days" | "weeks" | "months";
}): string | null {
  if (input.durationMode !== "custom") {
    return null;
  }

  const base = new Date();
  const rawValue = input.durationValue ?? 30;
  const value = Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 30;
  const unit = input.durationUnit ?? "days";
  const days =
    unit === "months" ? value * 30 : unit === "weeks" ? value * 7 : value;
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

export function useCreatePlanMutation(): {
  isSubmitting: boolean;
  createPlan: (input: CreatePlanInput) => void;
} {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const createPlan = React.useCallback(
    async (input: CreatePlanInput) => {
      setIsSubmitting(true);
      try {
        const targetDueDate = computeTargetDueDate(input);

        const plan = await createPlanApi({
          materialIds: input.sourceMaterialIds,
          targetDueDate,
          specialRequirements: input.notes,
        });

        navigate(`/plans/${plan.id}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate],
  );

  return { isSubmitting, createPlan };
}
