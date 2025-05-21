import { ContentfulStatusCode } from "hono/utils/http-status";

export class HTTPError extends Error {
  private readonly statusCode: ContentfulStatusCode;
  private readonly details?: string[];

  constructor(
    {
      message,
      details,
    }: {
      message: string;
      details?: string[];
    },
    statusCode: ContentfulStatusCode,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }

  getMessage() {
    return this.message;
  }

  getStatusCode() {
    return this.statusCode;
  }

  getDetails() {
    return this.details;
  }
}
