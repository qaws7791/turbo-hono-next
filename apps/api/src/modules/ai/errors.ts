import { ContentfulStatusCode } from "hono/utils/http-status";
import { BaseError } from "../../errors/base.error";

export type AIErrorType =
  | "generation_failed"
  | "invalid_request"
  | "api_key_missing"
  | "quota_exceeded"
  | "model_unavailable"
  | "parsing_failed"
  | "internal_error"
  | "authentication_required"
  | "database_error"
  | "database_transaction_failed"
  | "document_not_found"
  | "roadmap_not_found"
  | "subgoal_not_found"
  | "access_denied"
  | "note_generation_failed";

export type AIErrorCode = `ai:${AIErrorType}`;

export class AIError extends BaseError {
  constructor(
    public readonly statusCode: ContentfulStatusCode,
    public readonly code: AIErrorCode,
    public readonly message: string,
  ) {
    super(statusCode, code, message);
  }
}
