/**
 * 크리에이터 상태 열거형
 * 크리에이터 계정의 상태를 정의합니다.
 */
export enum CreatorStatus {
  PENDING = 'pending',   // 가입 신청 후 관리자 승인 대기
  APPROVED = 'approved', // 관리자 승인 완료
  REJECTED = 'rejected', // 관리자 반려
  ACTIVE = 'active',     // 승인 후 정상 활동 가능
  INACTIVE = 'inactive', // 관리자에 의해 비활성화됨 (일시적)
  SUSPENDED = 'suspended', // 관리자에 의해 정지됨 (보안, 정책 위반 등)
}
