import { queryOptions } from "@tanstack/react-query";

import type { DailyActivityParams } from "@/features/progress/api/progress-service";

import { getDailyActivity } from "@/features/progress/api/progress-service";
import { progressKeys } from "@/features/progress/api/query-keys";

export const dailyActivityQueryOptions = (params: DailyActivityParams) =>
  queryOptions({
    queryKey: progressKeys.daily(params.start, params.end),
    queryFn: () => getDailyActivity(params),
    staleTime: 1000 * 60 * 5,
  });
