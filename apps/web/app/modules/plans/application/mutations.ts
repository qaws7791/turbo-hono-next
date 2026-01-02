import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  activatePlan,
  createPlan,
  setPlanStatus,
  updatePlanSession,
} from "../api";

import { planKeys } from "./keys";

import type { ApiError } from "~/modules/api";
import type {
  CreatePlanBody,
  PlanDetail,
  PlanListItem,
  PlanStatus,
  UpdatePlanSessionBody,
  UpdatePlanSessionResponse,
} from "../domain";

import { homeKeys } from "~/modules/home";

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

  return useMutation<
    { id: string; status: PlanStatus },
    ApiError,
    { planId: string; status: PlanStatus }
  >({
    mutationFn: setPlanStatus,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: planKeys.all });
      queryClient.setQueryData(
        planKeys.detail(data.id),
        (prev: PlanDetail | undefined) => {
          if (!prev) return prev;
          return { ...prev, status: data.status };
        },
      );
    },
  });
}

export function useActivatePlanMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; status: PlanListItem["status"] },
    ApiError,
    { planId: string }
  >({
    mutationFn: activatePlan,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}

export function useUpdatePlanSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdatePlanSessionResponse,
    ApiError,
    { planId: string; sessionId: string; body: UpdatePlanSessionBody }
  >({
    mutationFn: ({ sessionId, body }) => updatePlanSession({ sessionId, body }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: planKeys.detail(variables.planId),
      });
      await queryClient.invalidateQueries({ queryKey: homeKeys.queue() });
    },
  });
}
