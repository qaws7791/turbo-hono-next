import type { PlanListItem } from "~/modules/plans";

export type SpacePlansModel = {
  plans: Array<PlanListItem>;
};

export function useSpacePlansModel(input: {
  plans: Array<PlanListItem>;
}): SpacePlansModel {
  return {
    plans: input.plans,
  };
}
