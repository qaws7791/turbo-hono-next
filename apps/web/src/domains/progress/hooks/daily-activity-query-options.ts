import { queryOptions } from "@tanstack/react-query";

import { api } from "@/api/http-client";

export interface DailyActivityParams {
  start: string;
  end: string;
}

export const dailyActivityQueryOptions = (params: DailyActivityParams) =>
  queryOptions({
    queryKey: ["progress", "daily", params.start, params.end],
    queryFn: () => api.progress.daily(params),
    staleTime: 1000 * 60 * 5,
  });
