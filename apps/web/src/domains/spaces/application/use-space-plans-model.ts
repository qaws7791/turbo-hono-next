import type { PlanWithDerived } from "~/domains/plans";

export type SpacePlansModel = {
  plans: Array<PlanWithDerived>;
};

export function useSpacePlansModel(input: {
  plans: Array<PlanWithDerived>;
}): SpacePlansModel {
  return {
    plans: input.plans,
  };
}
