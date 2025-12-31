import type { JobStatus } from "./types";

import { apiClient, unwrap } from "~/modules/api";

export async function fetchJob(jobId: string): Promise<JobStatus> {
  const result = await apiClient.GET("/api/jobs/{jobId}", {
    params: { path: { jobId } },
  });
  const { data } = unwrap(result);

  return {
    jobId: data.jobId,
    status: data.status,
    progress: data.progress,
    currentStep: data.currentStep,
    result: data.result
      ? { materialId: data.result.materialId, summary: data.result.summary }
      : null,
    error: data.error
      ? { code: data.error.code, message: data.error.message }
      : null,
  };
}
