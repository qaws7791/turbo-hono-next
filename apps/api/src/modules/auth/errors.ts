import { ContentfulStatusCode } from "hono/utils/http-status";
import { BaseError } from "../../errors/base.error";

//snake_case
export type AuthErrorType =
  | "authentication_required"
  | "invalid_or_expired_session"
  | "invalid_credentials"
  | "user_exists"
  | "internal_error";

export type AuthErrorCode = `auth:${AuthErrorType}`;

export class AuthError extends BaseError {
  constructor(
    public readonly statusCode: ContentfulStatusCode,
    public readonly code: AuthErrorCode,
    public readonly message: string,
  ) {
    super(statusCode, code, message);
  }
}
