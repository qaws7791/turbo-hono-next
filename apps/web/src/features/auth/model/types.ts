/**
 * Auth Domain Models
 *
 * API 응답 구조와 독립적인 비즈니스 엔티티 정의
 * - 컴포넌트와 훅에서 안정된 인터페이스로 사용
 * - API 변경에 대한 영향 최소화
 */

/**
 * 인증된 사용자 도메인 모델
 */
export interface User {
  readonly id: string;
  readonly username: string;
  readonly email: string;
}
