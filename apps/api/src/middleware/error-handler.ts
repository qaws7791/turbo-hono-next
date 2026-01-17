import { ZodError } from "zod";

import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Logger } from "pino";

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    validation?: Array<{ field: string; code: string; message: string }>;
  };
};

export class ApiError extends Error {
  constructor(
    public readonly status: ContentfulStatusCode,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function toApiErrorResponse(
  error: unknown,
  requestId?: string,
): {
  readonly status: ContentfulStatusCode;
  readonly body: ApiErrorResponse;
} {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
    };
  }

  if (error instanceof ZodError) {
    return {
      status: 422,
      body: {
        error: {
          code: "VALIDATION_ERROR",
          message: "입력값이 올바르지 않습니다.",
          validation: error.issues.map((issue) => ({
            field: issue.path.join("."),
            code: issue.code.toUpperCase(),
            message: issue.message,
          })),
        },
      },
    };
  }

  return {
    status: 500,
    body: {
      error: {
        code: "INTERNAL_ERROR",
        message: "서버에서 오류가 발생했습니다.",
        details: requestId ? { requestId } : undefined,
      },
    },
  };
}

export function createErrorHandlerMiddleware(logger: Logger) {
  return function errorHandlerMiddleware(error: unknown, c: Context) {
    const requestId = c.get("requestId");

    if (error instanceof ApiError) {
      logger.warn(
        {
          requestId,
          method: c.req.method,
          path: c.req.path,
          status: error.status,
          code: error.code,
          details: error.details,
          err: error,
        },
        "request.api_error",
      );
      return c.json(
        toApiErrorResponse(error, requestId).body satisfies ApiErrorResponse,
        error.status,
      );
    }

    if (error instanceof ZodError) {
      return c.json(
        toApiErrorResponse(error, requestId).body satisfies ApiErrorResponse,
        422,
      );
    }

    logger.error(
      { requestId, method: c.req.method, path: c.req.path, err: error },
      "request.error",
    );

    const response = toApiErrorResponse(error, requestId);
    return c.json(response.body satisfies ApiErrorResponse, 500);
  };
}
