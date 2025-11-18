import { queryOptions } from "@tanstack/react-query";

import type { DailyActivityParams } from "@/features/progress/api/progress-service";

import { getDailyActivity } from "@/features/progress/api/progress-service";
import { progressKeys } from "@/features/progress/api/query-keys";

/**
 * NOTE: Return type is intentionally omitted to allow TypeScript to infer
 * the precise type from queryOptions, which includes specific tuple types
 * for queryKey that cannot be accurately represented with explicit type annotations.
 */
export const dailyActivityQueryOptions = (params: DailyActivityParams) =>
  queryOptions({
    queryKey: progressKeys.daily(params.start, params.end),
    queryFn: () => getDailyActivity(params),
    staleTime: 1000 * 60 * 5,
  });
