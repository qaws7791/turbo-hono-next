import { toPlanFromDetail, toPlanFromListItem } from "./plans.mapper";

import type { PlanWithDerived } from "../model/types";
import type {
  ApiPlanDetail,
  PlanCreateAccepted,
  PlanCreateBody,
  PlanStatusUpdateBody,
  PlansListOk,
  PlansListQuery,
} from "./plans.dto";

import { apiClient } from "~/foundation/api/client";
import { ApiError } from "~/foundation/api/error";

export type PlansList = {
  data: Array<PlanWithDerived>;
  meta: PlansListOk["meta"];
};

export async function listPlans(query?: PlansListQuery): Promise<PlansList> {
  const { data, error, response } = await apiClient.GET("/api/plans", {
    params: { query },
  });
  if (!response.ok || !data) {
    throw new ApiError("Failed to list plans", response.status, error);
  }

  return {
    data: data.data.map((item) => toPlanFromListItem(item)),
    meta: data.meta,
  };
}

export async function getPlan(planId: string): Promise<PlanWithDerived> {
  const { data, error, response } = await apiClient.GET("/api/plans/{planId}", {
    params: { path: { planId } },
  });
  if (!response.ok || !data) {
    throw new ApiError("Failed to get plan", response.status, error);
  }

  return toPlanFromDetail(data.data as ApiPlanDetail);
}

export async function activatePlan(planId: string): Promise<void> {
  const { error, response } = await apiClient.POST(
    "/api/plans/{planId}/activate",
    { params: { path: { planId } } },
  );
  if (!response.ok) {
    throw new ApiError("Failed to activate plan", response.status, error);
  }
}

export async function updatePlanStatus(
  planId: string,
  status: PlanStatusUpdateBody["status"],
): Promise<void> {
  const { error, response } = await apiClient.PATCH(
    "/api/plans/{planId}/status",
    { params: { path: { planId } }, body: { status } },
  );
  if (!response.ok) {
    throw new ApiError("Failed to update plan status", response.status, error);
  }
}

export async function createPlan(
  body: PlanCreateBody,
): Promise<PlanCreateAccepted> {
  const { data, error, response } = await apiClient.POST("/api/plans", {
    body,
  });
  if (!response.ok || !data) {
    throw new ApiError("Failed to create plan", response.status, error);
  }
  return data.data;
}
