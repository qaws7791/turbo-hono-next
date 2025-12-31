import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


import { activatePlan, createPlan, fetchPlan, fetchSpacePlans, setPlanStatus } from "./api";

import type { CreatePlanBody, PlanDetail, PlanListItem, PlanStatus, SpacePlansResponse } from "./types";
import type { ApiError } from "~/modules/api";

const planKeys = {
  all: ["plans"] as const,
  bySpace: (input: {
    spaceId: string;
    page?: number;
    limit?: number;
    status?: "ACTIVE" | "PAUSED" | "ARCHIVED" | "COMPLETED";
  }) =>
    [
      ...planKeys.all,
      "space",
      input.spaceId,
      "list",
      input.page ?? 1,
      input.limit ?? 20,
      input.status ?? "ALL",
    ] as const,
  detail: (planId: string) => [...planKeys.all, "detail", planId] as const,
};

export function useSpacePlansQuery(input: {
  spaceId: string;
  page?: number;
  limit?: number;
  status?: "ACTIVE" | "PAUSED" | "ARCHIVED" | "COMPLETED";
}) {
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

export function useCreatePlanMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; status: PlanListItem["status"]; title: string },
    ApiError,
    { spaceId: string; body: CreatePlanBody }
  >({
    mutationFn: createPlan,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: planKeys.bySpace({ spaceId: variables.spaceId }),
      });
    },
  });
}

export function useSetPlanStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ id: string; status: PlanStatus }, ApiError, { planId: string; status: PlanStatus }>({
    mutationFn: setPlanStatus,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: planKeys.all });
      queryClient.setQueryData(planKeys.detail(data.id), (prev) => {
        if (!prev) return prev;
        return { ...prev, status: data.status };
      });
    },
  });
}

export function useActivatePlanMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ id: string; status: PlanListItem["status"] }, ApiError, { planId: string }>({
    mutationFn: activatePlan,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}

