import { useFetcher } from "react-router";

import type { PlanWithDerived } from "~/foundation/api/compat/plans";

export type SpacePlansModel = {
  isSubmitting: boolean;
  fetcher: ReturnType<typeof useFetcher>;
  plans: Array<PlanWithDerived>;
};

export function useSpacePlansModel(input: {
  plans: Array<PlanWithDerived>;
}): SpacePlansModel {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";

  return {
    isSubmitting,
    fetcher,
    plans: input.plans,
  };
}
