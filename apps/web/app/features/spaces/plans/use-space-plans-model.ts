import { useFetcher } from "react-router";

import type { listPlans } from "~/mock/api";

export type SpacePlansModel = {
  isSubmitting: boolean;
  fetcher: ReturnType<typeof useFetcher>;
  plans: ReturnType<typeof listPlans>;
};

export function useSpacePlansModel(input: {
  plans: ReturnType<typeof listPlans>;
}): SpacePlansModel {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";

  return {
    isSubmitting,
    fetcher,
    plans: input.plans,
  };
}
