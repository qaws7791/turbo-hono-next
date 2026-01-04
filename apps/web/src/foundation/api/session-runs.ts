import { apiClient } from "./client";
import { ApiError } from "./error";

export async function saveSessionRunProgress(input: {
  runId: string;
  stepIndex: number;
  inputs: Record<string, unknown>;
}): Promise<void> {
  const { error, response } = await apiClient.PATCH(
    "/api/session-runs/{runId}/progress",
    {
      params: { path: { runId: input.runId } },
      body: { stepIndex: input.stepIndex, inputs: input.inputs },
    },
  );
  if (!response.ok) {
    throw new ApiError(
      "Failed to save session progress",
      response.status,
      error,
    );
  }
}

export async function completeSessionRun(runId: string): Promise<void> {
  const { error, response } = await apiClient.POST(
    "/api/session-runs/{runId}/complete",
    { params: { path: { runId } } },
  );
  if (!response.ok) {
    throw new ApiError(
      "Failed to complete session run",
      response.status,
      error,
    );
  }
}
