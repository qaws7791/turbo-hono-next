import { BaseError } from "../../../shared/errors/base.error";

export class UserNotFoundError extends BaseError {
  constructor(message: string = "User not found") {
    super(message, 404, "USER_NOT_FOUND");
  }
}

export class UserAlreadyExistsError extends BaseError {
  constructor(message: string = "User already exists") {
    super(message, 409, "USER_ALREADY_EXISTS");
  }
}

export class InvalidUserDataError extends BaseError {
  constructor(message: string = "Invalid user data") {
    super(message, 400, "INVALID_USER_DATA");
  }
}

export class UserNotCreatorError extends BaseError {
  constructor(message: string = "User is not a creator") {
    super(message, 403, "USER_NOT_CREATOR");
  }
}

export class AlreadyCreatorError extends BaseError {
  constructor(message: string = "User is already a creator") {
    super(message, 403, "ALREADY_CREATOR");
  }
}

export class UnauthorizedUserActionError extends BaseError {
  constructor(message: string = "Unauthorized user action") {
    super(message, 403, "UNAUTHORIZED_USER_ACTION");
  }
}

export class AlreadyFollowingError extends BaseError {
  constructor(message: string = "Already following") {
    super(message, 400, "ALREADY_FOLLOWING");
  }
}

export class InvalidUserActionError extends BaseError {
  constructor(message: string = "Invalid user action") {
    super(message, 400, "INVALID_USER_ACTION");
  }
}
