import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ErrorCode } from "./error-codes";

/**
 * Details object for additional error context
 */
export interface ErrorDetails {
  [key: string]: unknown;
}

/**
 * Base error class for all application errors.
 * Provides standardized error structure with code, message, and optional details.
 */
export class BaseError extends Error {
  public readonly timestamp: string;

  constructor(
    public readonly statusCode: ContentfulStatusCode,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: ErrorDetails,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
