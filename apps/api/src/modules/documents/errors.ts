import { BaseError } from "../../errors/base.error";

import type { ContentfulStatusCode } from "hono/utils/http-status";

export type DocumentErrorType =
  | "document_not_found"
  | "access_denied"
  | "invalid_file_type"
  | "file_too_large"
  | "upload_failed"
  | "download_failed"
  | "deletion_failed"
  | "extraction_failed"
  | "validation_failed"
  | "document_linked_to_learning_plan"
  | "missing_file"
  | "storage_error"
  | "internal_error";

export type DocumentErrorCode = `document:${DocumentErrorType}`;

export class DocumentError extends BaseError {
  constructor(
    public readonly statusCode: ContentfulStatusCode,
    public readonly code: DocumentErrorCode,
    public readonly message: string,
  ) {
    super(statusCode, code, message);
  }
}
