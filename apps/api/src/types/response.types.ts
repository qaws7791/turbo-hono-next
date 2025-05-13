/**
 * standard response type for api
 * based on google api style guide, microsoft rest api guidelines
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  /** HTTP 상태 코드 */
  status: number;
  /** 성공 여부 */
  success: boolean;
  /** 응답 데이터 */
  data?: T;
  /** 에러 메시지 */
  error?: {
    /** 에러 코드 */
    code: string;
    /** 에러 메시지 */
    message: string;
    /** 상세 에러 정보 */
    details?: string[];
  };
  /** 페이지네이션 정보 */
  pagination?: {
    /** 현재 페이지 */
    currentPage: number;
    /** 페이지당 항목 수 */
    pageSize: number;
    /** 전체 항목 수 */
    totalItems: number;
    /** 전체 페이지 수 */
    totalPages: number;
  };
  /** 메타데이터 */
  metadata?: string[];
}

export interface ApiErrorResponse extends Omit<ApiResponse, "data"> {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

export interface ApiSuccessResponse<T> extends Omit<ApiResponse<T>, "error"> {
  success: true;
  data: T;
}
