import { BaseError } from "../../../shared/errors/base.error";

export class BookmarkNotFoundError extends BaseError {
  constructor(message: string = "Bookmark not found") {
    super(message, 404, "BOOKMARK_NOT_FOUND");
  }
}

export class BookmarkAlreadyExistsError extends BaseError {
  constructor(message: string = "Bookmark already exists") {
    super(message, 409, "BOOKMARK_ALREADY_EXISTS");
  }
}

export class InvalidBookmarkDataError extends BaseError {
  constructor(message: string = "Invalid bookmark data") {
    super(message, 400, "INVALID_BOOKMARK_DATA");
  }
}

export class UnauthorizedBookmarkActionError extends BaseError {
  constructor(message: string = "Unauthorized bookmark action") {
    super(message, 403, "UNAUTHORIZED_BOOKMARK_ACTION");
  }
}

export class BookmarkTargetNotFoundError extends BaseError {
  constructor(message: string = "Bookmark target not found") {
    super(message, 404, "BOOKMARK_TARGET_NOT_FOUND");
  }
}