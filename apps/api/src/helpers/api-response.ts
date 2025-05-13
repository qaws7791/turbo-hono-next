import { APIErrorResponse, APIResourceResponse } from "@/types/response.types";

export const createResourceResponse = <T>({
  status,
  data,
  pagination,
  metadata,
}: {
  status: number;
  data: T;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  metadata?: string[];
}): APIResourceResponse<T> => {
  return {
    success: true,
    status,
    data,
    pagination,
    metadata,
  };
};

export const createErrorResponse = (
  statusCode: number,
  message: string,
  details?: string[],
): APIErrorResponse => {
  const error: { code: string; message: string; details?: string[] } = {
    code: statusCode.toString(),
    message,
  };

  if (details?.length) {
    error.details = details;
  }

  return {
    success: false,
    status: statusCode,
    error: {
      code: statusCode.toString(),
      message,
      details,
    },
  };
};
