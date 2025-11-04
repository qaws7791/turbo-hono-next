import { BaseError } from "../../errors/base.error";
import { ErrorCodes } from "../../errors/error-codes";

import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ErrorDetails } from "../../errors/base.error";
import type { ErrorCode } from "../../errors/error-codes";

/**
 * Authentication specific error class.
 * Uses standardized error codes from error-codes.ts
 */
export class AuthError extends BaseError {
  constructor(
    statusCode: ContentfulStatusCode,
    code: ErrorCode,
    message?: string,
    details?: ErrorDetails,
  ) {
    super(statusCode, code, message || `Auth error: ${code}`, details);
  }
}

/**
 * Factory functions for common authentication errors
 */
export const AuthErrors = {
  signupFailed: (details?: ErrorDetails) =>
    new AuthError(
      500,
      ErrorCodes.AUTH_SIGNUP_FAILED,
      "Failed to create account",
      details,
    ),
  passwordChangeFailed: (details?: ErrorDetails) =>
    new AuthError(
      500,
      ErrorCodes.AUTH_PASSWORD_CHANGE_FAILED,
      "Failed to change password",
      details,
    ),
  sessionCreationFailed: (details?: ErrorDetails) =>
    new AuthError(
      500,
      ErrorCodes.AUTH_SESSION_CREATE_FAILED,
      "Failed to create session",
      details,
    ),
  sessionDeletionFailed: (details?: ErrorDetails) =>
    new AuthError(
      500,
      ErrorCodes.AUTH_SESSION_DELETE_FAILED,
      "Failed to delete session",
      details,
    ),
  invalidCredentials: (details?: ErrorDetails) =>
    new AuthError(
      401,
      ErrorCodes.AUTH_INVALID_CREDENTIALS,
      "Invalid email or password",
      details,
    ),

  sessionExpired: (details?: ErrorDetails) =>
    new AuthError(
      401,
      ErrorCodes.AUTH_SESSION_EXPIRED,
      "Your session has expired. Please log in again",
      details,
    ),

  unauthorized: (details?: ErrorDetails) =>
    new AuthError(
      401,
      ErrorCodes.AUTH_UNAUTHORIZED,
      "Authentication required",
      details,
    ),

  forbidden: (details?: ErrorDetails) =>
    new AuthError(
      403,
      ErrorCodes.AUTH_FORBIDDEN,
      "You don't have permission to access this resource",
      details,
    ),

  userNotFound: (details?: ErrorDetails) =>
    new AuthError(
      404,
      ErrorCodes.AUTH_USER_NOT_FOUND,
      "User not found",
      details,
    ),

  emailExists: (details?: ErrorDetails) =>
    new AuthError(
      409,
      ErrorCodes.AUTH_EMAIL_ALREADY_EXISTS,
      "Email address already registered",
      details,
    ),

  weakPassword: (details?: ErrorDetails) =>
    new AuthError(
      400,
      ErrorCodes.AUTH_WEAK_PASSWORD,
      "Password does not meet security requirements",
      details,
    ),

  tokenInvalid: (details?: ErrorDetails) =>
    new AuthError(
      401,
      ErrorCodes.AUTH_TOKEN_INVALID,
      "Invalid authentication token",
      details,
    ),
};
