import { useQuery } from "@tanstack/react-query";

import { fetchPlan, fetchSpacePlans } from "../api";

import { planKeys } from "./keys";

import type { ApiError } from "~/modules/api";
import type { PlanDetail, SpacePlansResponse } from "../domain";
import type { PlansBySpaceKeyInput } from "./keys";

export function useSpacePlansQuery(input: PlansBySpaceKeyInput) {
  return useQuery<SpacePlansResponse, ApiError>({
    queryKey: planKeys.bySpace(input),
    queryFn: () => fetchSpacePlans(input),
    enabled: input.spaceId.length > 0,
  });
}

export function usePlanQuery(planId: string) {
  return useQuery<PlanDetail, ApiError>({
    queryKey: planKeys.detail(planId),
    queryFn: () => fetchPlan(planId),
    enabled: planId.length > 0,
  });
}
