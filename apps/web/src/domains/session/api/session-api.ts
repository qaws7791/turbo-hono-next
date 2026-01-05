import type { paths } from "~/foundation/types/api";

import { apiClient } from "~/foundation/api/client";
import { ApiError } from "~/foundation/api/error";
import { randomUuidV4 } from "~/foundation/lib/uuid";

type CreateRunOk =
  | paths["/api/sessions/{sessionId}/runs"]["post"]["responses"]["200"]["content"]["application/json"]["data"]
  | paths["/api/sessions/{sessionId}/runs"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

export async function createOrResumeSessionRun(sessionId: string): Promise<{
  runId: string;
  isRecovery: boolean;
}> {
  const { data, error, response } = await apiClient.POST(
    "/api/sessions/{sessionId}/runs",
    {
      params: { path: { sessionId } },
      headers: { "Idempotency-Key": randomUuidV4() },
    },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to create session run", response.status, error);
  }

  const run = data.data as CreateRunOk;
  return { runId: run.runId, isRecovery: run.isRecovery };
}
