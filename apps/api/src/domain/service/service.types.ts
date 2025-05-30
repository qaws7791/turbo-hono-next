/**
 * 서비스 레이어 타입 정의
 * 도메인 서비스 인터페이스를 정의합니다.
 */

// 공통 타입
export interface PaginationOptions {
  limit: number;
  page?: number;
}

export interface PaginationCursorOptions {
  limit: number;
  cursor?: string;
}


export interface PaginationResult<T> {
  items: T[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  nextPage: number | null;
  prevPage: number | null;
}

export interface PaginationCursorResult<T> {
  items: T[];
  nextCursor?: string | number | null;
}