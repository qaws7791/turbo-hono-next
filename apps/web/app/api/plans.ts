import { apiClient } from "./client";
import { ApiError } from "./error";

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
