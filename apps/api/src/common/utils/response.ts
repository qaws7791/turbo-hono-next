export interface ErrorDetails {
  code: string;
  message: string;
}

export interface IAPIResponse<T = any> {
  status: number;
  success: boolean;
  data: T;
  error?: ErrorDetails;
  pagination?: {
    currentPage?: number;
    itemCount: number;
    itemsPerPage: number;
    totalItems?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
    nextCursor?: string | null;
    prevCursor?: string | null;
  };
}

export type IAPIErrorResponse = Omit<IAPIResponse, "data" | "pagination"> & {
  success: false;
};
export type IAPISuccessResponse<T> = Omit<IAPIResponse, "error"> & {
  success: true;
  data: T;
};

export class APIResponse {
  public static success<T>(
    data: T,
    statusCode: number = 200,
    pagination: IAPIResponse<T>["pagination"],
  ): IAPISuccessResponse<T> {
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
  ): IAPIErrorResponse {
    return {
      status: statusCode,
      success: false,
      error,
    };
  }
}
