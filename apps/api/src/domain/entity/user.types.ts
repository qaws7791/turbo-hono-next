/**
 * 사용자 역할 열거형
 * 플랫폼 내에서 사용자가 가질 수 있는 역할을 정의합니다.
 */
export enum UserRole {
  USER = 'user',
  CREATOR = 'creator',
}

/**
 * 사용자 상태 열거형
 * 플랫폼 내에서 사용자 계정의 상태를 정의합니다.
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/**
 * 소셜 계정 제공자 열거형
 * 지원되는 소셜 로그인 제공자를 정의합니다.
 */
export enum SocialProvider {
  KAKAO = 'kakao',
  EMAIL = 'email',
}

export const EmailProvider = "email"