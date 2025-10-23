import { useQuery } from "@tanstack/react-query";

import type { DailyActivityParams } from "@/features/progress/api/progress-service";

import { dailyActivityQueryOptions } from "@/features/progress/api/progress-queries";

export function useDailyActivity(params: DailyActivityParams) {
  return useQuery(dailyActivityQueryOptions(params));
}
