import { toPlanFromDetail, toPlanFromListItem } from "../model/mappers";

import type { PlanWithDerived } from "../model/types";

import { apiClient } from "~/foundation/api/client";
import { ApiError } from "~/foundation/api/error";

export async function listPlansForUi(
  spaceId: string,
): Promise<Array<PlanWithDerived>> {
  const { data, error, response } = await apiClient.GET(
    "/api/spaces/{spaceId}/plans",
    { params: { path: { spaceId } } },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to list plans", response.status, error);
  }
  return data.data.map((item) => toPlanFromListItem(item, spaceId));
}

export async function getPlanForUi(planId: string): Promise<PlanWithDerived> {
  const { data, error, response } = await apiClient.GET("/api/plans/{planId}", {
    params: { path: { planId } },
  });
  if (!response.ok || !data) {
    throw new ApiError("Failed to get plan", response.status, error);
  }
  return toPlanFromDetail(data.data);
}

export async function getActivePlanForSpaceUi(
  spaceId: string,
): Promise<PlanWithDerived | null> {
  const { data, error, response } = await apiClient.GET(
    "/api/spaces/{spaceId}/plans",
    { params: { path: { spaceId }, query: { status: "ACTIVE", limit: 1 } } },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to list active plans", response.status, error);
  }
  const first = data.data[0];
  return first ? toPlanFromListItem(first, spaceId) : null;
}
