/**
 * Progress API Response Types
 *
 * OpenAPI 스펙에서 자동 생성된 타입에서 추출한 API 응답 타입
 */

import type { paths } from "@/api/schema";

/**
 * GET /progress/daily 응답 타입
 */
export type ApiDailyActivityResponse =
  paths["/progress/daily"]["get"]["responses"][200]["content"]["application/json"];

/**
 * DailyActivity 데이터 타입 (ApiDailyActivityResponse와 동일)
 */
export type ApiDailyActivityData = ApiDailyActivityResponse;

/**
 * 특정 날짜의 활동 데이터
 */
export type ApiDailyActivityDay = ApiDailyActivityData["items"][number];

/**
 * 마감 예정 학습 태스크
 */
export type ApiDueLearningTask = ApiDailyActivityDay["due"][number];

/**
 * 완료된 학습 태스크
 */
export type ApiCompletedLearningTask = ApiDailyActivityDay["completed"][number];
