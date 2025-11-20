/**
 * Auth API Response Types
 *
 * OpenAPI 스펙에서 자동 생성된 타입에서 추출한 API 응답 타입
 * - API 계층에서만 사용
 * - 도메인 모델로 변환하여 애플리케이션 레이어에 전달
 */

import type { paths } from "@/api/schema";

/**
 * POST /auth/login 응답의 user 필드 타입
 */
export type ApiLoginUser =
  paths["/auth/login"]["post"]["responses"][200]["content"]["application/json"]["user"];

/**
 * GET /auth/me 응답 타입
 */
export type ApiMeResponse =
  paths["/auth/me"]["get"]["responses"][200]["content"]["application/json"];

/**
 * 통합 API 사용자 타입
 * - login, signup, me 엔드포인트의 사용자 정보가 동일한 구조
 */
export type ApiUser = ApiLoginUser | ApiMeResponse;
