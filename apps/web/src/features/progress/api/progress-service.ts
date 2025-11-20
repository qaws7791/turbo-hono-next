import type {
  DailyActivity,
  DailyActivityParams,
} from "@/features/progress/model/types";

import { api } from "@/api/http-client";
import { mapApiDataToDailyActivity } from "@/features/progress/model/mappers";

export type { DailyActivity, DailyActivityParams };

/**
 * 일일 활동 데이터를 조회합니다.
 *
 * @param params - 조회 기간 (start, end)
 * @returns 도메인 DailyActivity 모델 또는 null
 */
export async function getDailyActivity(
  params: DailyActivityParams,
): Promise<DailyActivity | null> {
  const response = await api.progress.daily(params);

  if (response.error || !response.data) {
    return null;
  }

  return mapApiDataToDailyActivity(response.data);
}
