import { log } from "../lib/logger";

import { BaseError } from "./base.error";
import { ErrorCodes, getErrorMessage } from "./error-codes";

import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Context } from "hono";
import type { ErrorDetails } from "./base.error";
import type { ErrorCode } from "./error-codes";

/**
 * Standardized error response structure
 */
export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: ErrorDetails;
    timestamp: string;
  };
}

/**
 * Creates a standardized error response from any error type
 */
export function createErrorResponse(
  error: unknown,
): ErrorResponse & { statusCode: ContentfulStatusCode } {
  // Handle BaseError (our custom errors)
  if (error instanceof BaseError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: error.timestamp,
      },
      statusCode: error.statusCode as ContentfulStatusCode,
    };
  }

  // Handle Zod validation errors from OpenAPI
  if (error && typeof error === "object" && "name" in error) {
    if (error.name === "ZodError") {
      const zodError = error as {
        issues?: Array<{ message: string; path: Array<string> }>;
      };
      return {
        error: {
          code: ErrorCodes.VALIDATION_INVALID_INPUT,
          message: getErrorMessage(ErrorCodes.VALIDATION_INVALID_INPUT),
          details: {
            issues: zodError.issues?.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          },
          timestamp: new Date().toISOString(),
        },
        statusCode: 400,
      };
    }
  }

  // Unknown error - log for debugging but don't expose internal details
  log.error("Unknown error occurred", error);

  return {
    error: {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: getErrorMessage(ErrorCodes.INTERNAL_SERVER_ERROR),
      timestamp: new Date().toISOString(),
    },
    statusCode: 500,
  };
}

/**
 * Global error handler for Hono
 */
export function handleError(error: unknown, c: Context) {
  const { error: errorData, statusCode } = createErrorResponse(error);

  return c.json({ error: errorData }, statusCode);
}
