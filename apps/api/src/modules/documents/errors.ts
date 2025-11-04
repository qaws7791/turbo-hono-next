import { BaseError } from "../../errors/base.error";
import { ErrorCodes } from "../../errors/error-codes";

import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ErrorCode } from "../../errors/error-codes";
import type { ErrorDetails } from "../../errors/base.error";

/**
 * Document specific error class.
 * Uses standardized error codes from error-codes.ts
 */
export class DocumentError extends BaseError {
  constructor(
    statusCode: ContentfulStatusCode,
    code: ErrorCode,
    message?: string,
    details?: ErrorDetails,
  ) {
    super(statusCode, code, message || `Document error: ${code}`, details);
  }
}

/**
 * Factory functions for common document errors
 */
export const DocumentErrors = {
  notFound: (details?: ErrorDetails) =>
    new DocumentError(
      404,
      ErrorCodes.NOT_FOUND_DOCUMENT,
      "Document not found",
      details,
    ),

  uploadFailed: (details?: ErrorDetails) =>
    new DocumentError(
      500,
      ErrorCodes.DOCUMENT_UPLOAD_FAILED,
      "Failed to upload document",
      details,
    ),

  invalidType: (details?: ErrorDetails) =>
    new DocumentError(
      400,
      ErrorCodes.DOCUMENT_INVALID_TYPE,
      "Invalid document type",
      details,
    ),

  tooLarge: (details?: ErrorDetails) =>
    new DocumentError(
      413,
      ErrorCodes.DOCUMENT_TOO_LARGE,
      "Document size exceeds limit",
      details,
    ),

  deleteFailed: (details?: ErrorDetails) =>
    new DocumentError(
      500,
      ErrorCodes.DOCUMENT_DELETE_FAILED,
      "Failed to delete document",
      details,
    ),

  parseFailed: (details?: ErrorDetails) =>
    new DocumentError(
      500,
      ErrorCodes.DOCUMENT_PARSE_FAILED,
      "Failed to parse document",
      details,
    ),

  storageError: (details?: ErrorDetails) =>
    new DocumentError(
      500,
      ErrorCodes.DOCUMENT_STORAGE_ERROR,
      "Document storage error",
      details,
    ),

  accessDenied: (details?: ErrorDetails) =>
    new DocumentError(403, ErrorCodes.AUTH_FORBIDDEN, "Access denied", details),

  validationFailed: (details?: ErrorDetails) =>
    new DocumentError(
      400,
      ErrorCodes.VALIDATION_INVALID_INPUT,
      "Document validation failed",
      details,
    ),
};
