/**
 * Auth Mappers
 *
 * API 응답 타입을 도메인 모델로 변환하는 함수들
 * - API 변경 시 이 레이어만 수정하면 됨
 * - 컴포넌트와 훅은 안정된 도메인 모델만 의존
 */

import type { ApiUser } from "@/features/auth/api/types";
import type { User } from "@/features/auth/model/types";

/**
 * API 사용자 응답을 도메인 User 모델로 변환
 *
 * @param apiUser - API 응답 사용자 객체 (login, signup, me 엔드포인트)
 * @returns 도메인 User 모델
 *
 * @example
 * ```ts
 * const apiUser = { id: "123", name: "John", email: "john@example.com" };
 * const user = mapApiUserToUser(apiUser);
 * // { id: "123", username: "John", email: "john@example.com" }
 * ```
 */
export function mapApiUserToUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    username: apiUser.name,
    email: apiUser.email,
  };
}
