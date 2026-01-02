import { useQuery } from "@tanstack/react-query";

import { fetchJob } from "../api";
import { JOB_POLL_INTERVAL_MS, isJobTerminal } from "../domain";

import { jobKeys } from "./keys";

import type { ApiError } from "~/modules/api";
import type { JobStatus } from "../domain";

export function useJobQuery(jobId: string, input?: { enabled?: boolean }) {
  return useQuery<JobStatus, ApiError>({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => fetchJob(jobId),
    enabled: (input?.enabled ?? true) && jobId.length > 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (isJobTerminal(status)) return false;
      return JOB_POLL_INTERVAL_MS;
    },
  });
}
