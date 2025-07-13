export class BaseError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly name: string,
  ) {
    super(message);
  }
}
