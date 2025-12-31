import { useQuery } from "@tanstack/react-query";


import { fetchJob } from "./api";

import type { JobStatus } from "./types";
import type { ApiError } from "~/modules/api";

const jobKeys = {
  all: ["jobs"] as const,
  detail: (jobId: string) => [...jobKeys.all, jobId] as const,
};

export function useJobQuery(jobId: string, input?: { enabled?: boolean }) {
  return useQuery<JobStatus, ApiError>({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => fetchJob(jobId),
    enabled: (input?.enabled ?? true) && jobId.length > 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "SUCCEEDED" || status === "FAILED") return false;
      return 2000;
    },
  });
}
