import { ZodError } from "zod";

import { logger } from "../lib/logger";

import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

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

export function errorHandlerMiddleware(error: unknown, c: Context) {
  const requestId = c.get("requestId");

  if (error instanceof ApiError) {
    return c.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      } satisfies ApiErrorResponse,
      error.status,
    );
  }

  if (error instanceof ZodError) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "입력값이 올바르지 않습니다.",
          validation: error.issues.map((issue) => ({
            field: issue.path.join("."),
            code: issue.code.toUpperCase(),
            message: issue.message,
          })),
        },
      } satisfies ApiErrorResponse,
      422,
    );
  }

  logger.error({ requestId, err: error }, "request.error");
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "서버에서 오류가 발생했습니다.",
        details: { requestId },
      },
    } satisfies ApiErrorResponse,
    500,
  );
}
