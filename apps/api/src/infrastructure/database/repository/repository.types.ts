/**
 * 리포지토리 레이어 타입 정의
 * 도메인 리포지토리 인터페이스를 정의합니다.
 */



// 필터 타입
export type Filter<T> = Partial<T>;

// 정렬 타입
export type SortOrder = 'asc' | 'desc';

export interface SortOptions<T> {
  field: keyof T;
  order: SortOrder;
}

// 페이지네이션 타입
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
  nextCursor: string | null;
}
  