/**
 * Auth Feature Public API
 *
 * 도메인 모델을 re-export하여 외부에서 사용하기 쉽게 합니다.
 * 이전 코드와의 호환성을 위해 AuthUser를 User로 별칭 export합니다.
 */

export type { User } from "@/features/auth/model/types";
export type { User as AuthUser } from "@/features/auth/model/types";
