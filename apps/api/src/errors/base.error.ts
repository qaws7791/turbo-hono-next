import { ContentfulStatusCode } from "hono/utils/http-status";

export class BaseError extends Error {
  constructor(
    public readonly statusCode: ContentfulStatusCode,
    public readonly errorCode: string,
    public readonly message: string,
  ) {
    super(message);
  }
}
