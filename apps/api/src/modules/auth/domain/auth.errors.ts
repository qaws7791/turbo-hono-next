import { BaseError } from "../../../shared/errors/base.error";

export class AuthenticationError extends BaseError {
  constructor(message: string = "Authentication failed") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class InvalidCredentialsError extends BaseError {
  constructor(message: string = "Invalid credentials") {
    super(message, 401, "INVALID_CREDENTIALS");
  }
}

export class UserNotFoundError extends BaseError {
  constructor(message: string = "User not found") {
    super(message, 404, "USER_NOT_FOUND");
  }
}

export class TokenExpiredError extends BaseError {
  constructor(message: string = "Token has expired") {
    super(message, 401, "TOKEN_EXPIRED");
  }
}

export class TokenAlreadyUsedError extends BaseError {
  constructor(message: string = "Token has already been used") {
    super(message, 400, "TOKEN_ALREADY_USED");
  }
}

export class InvalidTokenError extends BaseError {
  constructor(message: string = "Invalid token") {
    super(message, 400, "INVALID_TOKEN");
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string = "Unauthorized access") {
    super(message, 403, "UNAUTHORIZED");
  }
}

export class SessionExpiredError extends BaseError {
  constructor(message: string = "Session has expired") {
    super(message, 401, "SESSION_EXPIRED");
  }
}

export class KakaoAuthError extends BaseError {
  constructor(message: string = "Kakao authentication failed") {
    super(message, 400, "KAKAO_AUTH_ERROR");
  }
}
