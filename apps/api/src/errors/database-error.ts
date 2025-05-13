import { ContentfulStatusCode } from "hono/utils/http-status";

export class DatabaseError extends Error {
  private readonly statusCode: ContentfulStatusCode;

  constructor(message: string, statusCode: ContentfulStatusCode) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }

  getStatusCode() {
    return this.statusCode;
  }

  getMessage() {
    return this.message;
  }
}
