import { useQuery } from "@tanstack/react-query";

import type {DailyActivityParams} from "@/domains/progress/hooks/daily-activity-query-options";

import {
  
  dailyActivityQueryOptions
} from "@/domains/progress/hooks/daily-activity-query-options";

export function useDailyActivity(params: DailyActivityParams) {
  return useQuery(dailyActivityQueryOptions(params));
}
