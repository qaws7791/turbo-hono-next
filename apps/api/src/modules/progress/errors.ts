import { BaseError } from "../../errors/base.error";

import type { ContentfulStatusCode } from "hono/utils/http-status";


export type ProgressErrorType =
  | "invalid_date_range"
  | "invalid_date_format"
  | "internal_error";

export type ProgressErrorCode = `progress:${ProgressErrorType}`;

export class ProgressError extends BaseError {
  constructor(
    public readonly statusCode: ContentfulStatusCode,
    public readonly code: ProgressErrorCode,
    public readonly message: string,
  ) {
    super(statusCode, code, message);
  }
}
