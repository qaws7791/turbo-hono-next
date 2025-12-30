import { ResultAsync } from "neverthrow";

import { ApiError } from "../middleware/error-handler";

export type UnknownError = {
  readonly _tag: "UnknownError";
  readonly cause: unknown;
};

export type AppError = ApiError | UnknownError;

export function unknownError(cause: unknown): UnknownError {
  return { _tag: "UnknownError", cause };
}

export function toAppError(cause: unknown): AppError {
  if (cause instanceof ApiError) return cause;
  return unknownError(cause);
}

export function toThrowable(error: AppError): unknown {
  if (error instanceof ApiError) return error;
  return error.cause;
}

export function throwAppError(error: AppError): never {
  throw toThrowable(error);
}

export function fromPromise<T>(promise: Promise<T>): ResultAsync<T, AppError> {
  return ResultAsync.fromPromise(promise, (cause) => toAppError(cause));
}

export function tryPromise<T>(fn: () => Promise<T>): ResultAsync<T, AppError> {
  return ResultAsync.fromPromise(Promise.resolve().then(fn), (cause) =>
    toAppError(cause),
  );
}
