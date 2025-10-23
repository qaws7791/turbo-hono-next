import { api } from "@/api/http-client";

export interface DailyActivityParams {
  start: string;
  end: string;
}

export type DailyActivityResponse = Awaited<
  ReturnType<typeof api.progress.daily>
>;

export function getDailyActivity(params: DailyActivityParams) {
  return api.progress.daily(params);
}
