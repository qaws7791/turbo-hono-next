import type { JobStatus } from "../domain";

import { apiClient, unwrap } from "~/modules/api";

export async function fetchJob(jobId: string): Promise<JobStatus> {
  const result = await apiClient.GET("/api/jobs/{jobId}", {
    params: { path: { jobId } },
  });
  return unwrap(result).data;
}
