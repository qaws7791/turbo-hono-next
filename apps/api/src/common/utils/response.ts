export interface ErrorDetails {
  code: string;
  message: string;
}

export interface IAPIResponse<T = any> {
  status: number;
  success: boolean;
  data: T;
}

export type APIErrorResponse = Omit<IAPIResponse, "data" | "pagination"> & {
  error: ErrorDetails;
  success: false;
};
export type APISuccessResponse<T> = Omit<IAPIResponse, "error"> & {
  success: true;
  data: T;
};

export type Pagination = {
  totalPages: number;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  nextPage: number | null;
  prevPage: number | null;
};

export type PaginationCursor = {
  nextCursor: string | null;
};

export class APIResponse {
  public static success<T>(
    data: T,
    statusCode: number = 200,
  ) {
    return {
      status: statusCode,
      success: true,
      data,
    };
  }

  public static pagination<T>(
    data: T,
    pagination: Pagination,
    statusCode: number = 200,
  ) {
    return {
      status: statusCode,
      success: true,
      data,
      pagination,
    };
  }

  public static cursorPagination<T>(
    data: T,
    pagination: PaginationCursor,
    statusCode: number = 200,
  ) {
    return {
      status: statusCode,
      success: true,
      data,
      pagination,
    };
  }

  public static error(
    error: ErrorDetails,
    statusCode: number = 500,
  ): APIErrorResponse {
    return {
      status: statusCode,
      success: false,
      error,
    };
  }
}
