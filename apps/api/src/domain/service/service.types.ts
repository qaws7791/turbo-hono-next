/**
 * 서비스 레이어 타입 정의
 * 도메인 서비스 인터페이스를 정의합니다.
 */

// 공통 타입
export interface PaginationOptions {
  limit: number;
  offset?: number;
  cursor?: string | number;
}

export interface PaginationResult<T> {
  items: T[];
  nextCursor?: string | number;
  hasMore: boolean;
  totalCount?: number;
}
