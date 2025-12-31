import type {
  CreatePlanBody,
  PlanDetail,
  PlanListItem,
  PlanStatus,
  SpacePlansResponse,
} from "./types";

import { apiClient, unwrap } from "~/modules/api";


export async function fetchSpacePlans(input: {
  spaceId: string;
  page?: number;
  limit?: number;
  status?: "ACTIVE" | "PAUSED" | "ARCHIVED" | "COMPLETED";
}): Promise<SpacePlansResponse> {
  const result = await apiClient.GET("/api/spaces/{spaceId}/plans", {
    params: {
      path: { spaceId: input.spaceId },
      query: {
        page: input.page,
        limit: input.limit,
        status: input.status,
      },
    },
  });
  return unwrap(result);
}

export async function fetchPlan(planId: string): Promise<PlanDetail> {
  const result = await apiClient.GET("/api/plans/{planId}", {
    params: { path: { planId } },
  });
  return unwrap(result).data;
}

export async function createPlan(input: {
  spaceId: string;
  body: CreatePlanBody;
}): Promise<{ id: string; status: PlanListItem["status"]; title: string }> {
  const result = await apiClient.POST("/api/spaces/{spaceId}/plans", {
    params: { path: { spaceId: input.spaceId } },
    body: input.body,
  });
  const body = unwrap(result);
  return body.data;
}

export async function setPlanStatus(input: {
  planId: string;
  status: PlanStatus;
}): Promise<{ id: string; status: PlanStatus }> {
  const result = await apiClient.PATCH("/api/plans/{planId}/status", {
    params: { path: { planId: input.planId } },
    body: { status: input.status },
  });
  return unwrap(result).data;
}

export async function activatePlan(input: {
  planId: string;
}): Promise<{ id: string; status: PlanListItem["status"] }> {
  const result = await apiClient.POST("/api/plans/{planId}/activate", {
    params: { path: { planId: input.planId } },
  });
  return unwrap(result).data;
}

