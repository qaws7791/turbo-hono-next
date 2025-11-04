import { BaseError } from "../../errors/base.error";
import { ErrorCodes } from "../../errors/error-codes";

import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ErrorCode } from "../../errors/error-codes";
import type { ErrorDetails } from "../../errors/base.error";

/**
 * Progress specific error class.
 * Uses standardized error codes from error-codes.ts
 */
export class ProgressError extends BaseError {
  constructor(
    statusCode: ContentfulStatusCode,
    code: ErrorCode,
    message?: string,
    details?: ErrorDetails,
  ) {
    super(statusCode, code, message || `Progress error: ${code}`, details);
  }
}

/**
 * Factory functions for common progress errors
 */
export const ProgressErrors = {
  invalidDateRange: (details?: ErrorDetails) =>
    new ProgressError(
      400,
      ErrorCodes.VALIDATION_OUT_OF_RANGE,
      "Invalid date range",
      details,
    ),

  invalidDateFormat: (details?: ErrorDetails) =>
    new ProgressError(
      400,
      ErrorCodes.VALIDATION_INVALID_FORMAT,
      "Invalid date format",
      details,
    ),

  internalError: (details?: ErrorDetails) =>
    new ProgressError(
      500,
      ErrorCodes.INTERNAL_SERVER_ERROR,
      "Internal server error",
      details,
    ),
};
