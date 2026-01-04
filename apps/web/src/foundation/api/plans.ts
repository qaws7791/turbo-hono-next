import { apiClient } from "./client";
import { ApiError } from "./error";

import type { paths } from "~/foundation/types/api";

export async function activatePlan(planId: string): Promise<void> {
  const { error, response } = await apiClient.POST(
    "/api/plans/{planId}/activate",
    {
      params: { path: { planId } },
    },
  );
  if (!response.ok) {
    throw new ApiError("Failed to activate plan", response.status, error);
  }
}

export async function updatePlanStatus(
  planId: string,
  status: "ACTIVE" | "PAUSED" | "ARCHIVED" | "COMPLETED",
): Promise<void> {
  const { error, response } = await apiClient.PATCH(
    "/api/plans/{planId}/status",
    {
      params: { path: { planId } },
      body: { status },
    },
  );
  if (!response.ok) {
    throw new ApiError("Failed to update plan status", response.status, error);
  }
}

type PlanCreateBody = NonNullable<
  paths["/api/spaces/{spaceId}/plans"]["post"]["requestBody"]
>["content"]["application/json"];

type PlanCreateCreated =
  paths["/api/spaces/{spaceId}/plans"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

export async function createPlan(
  spaceId: string,
  body: PlanCreateBody,
): Promise<PlanCreateCreated> {
  const { data, error, response } = await apiClient.POST(
    "/api/spaces/{spaceId}/plans",
    {
      params: { path: { spaceId } },
      body,
    },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to create plan", response.status, error);
  }
  return data.data;
}
