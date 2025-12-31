import type { components } from "~/types/api";

type ErrorResponseBody = components["schemas"]["ErrorResponse"];
type ValidationIssue = NonNullable<ErrorResponseBody["error"]["validation"]>[number];

function isErrorResponseBody(value: unknown): value is ErrorResponseBody {
  if (!value || typeof value !== "object") return false;
  if (!("error" in value)) return false;
  const error = (value as { error: unknown }).error;
  if (!error || typeof error !== "object") return false;
  return "code" in error && "message" in error;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;
  public readonly validation?: Array<ValidationIssue>;
  public readonly response?: Response;

  public constructor(input: {
    status: number;
    message: string;
    code?: string;
    details?: Record<string, unknown>;
    validation?: Array<ValidationIssue>;
    response?: Response;
  }) {
    super(input.message);
    this.name = "ApiError";
    this.status = input.status;
    this.code = input.code;
    this.details = input.details;
    this.validation = input.validation;
    this.response = input.response;
  }
}

export function toApiError(response: Response, errorBody: unknown): ApiError {
  if (isErrorResponseBody(errorBody)) {
    return new ApiError({
      status: response.status,
      message: errorBody.error.message,
      code: errorBody.error.code,
      details: errorBody.error.details,
      validation: errorBody.error.validation,
      response,
    });
  }

  return new ApiError({
    status: response.status,
    message: response.statusText || "Request failed",
    response,
  });
}

export function unwrap<TData, TError>(result: {
  data?: TData;
  error?: TError;
  response: Response;
}): TData {
  if (result.data !== undefined) return result.data;
  throw toApiError(result.response, result.error);
}

export function isUnauthorizedError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 401;
}

