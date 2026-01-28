import { ResultAsync, err, ok } from "neverthrow";

import { coreError, isCoreError } from "./core-error";

import type { Result } from "neverthrow";
import type { CoreError } from "./core-error";

export type UnknownError = {
  readonly _tag: "UnknownError";
  readonly cause: unknown;
};

export type AppError = CoreError | UnknownError;

export function unknownError(cause: unknown): UnknownError {
  return { _tag: "UnknownError", cause };
}

export function toAppError(cause: unknown): AppError {
  if (isCoreError(cause)) return cause;
  return unknownError(cause);
}

function unknownCauseToError(cause: unknown): Error {
  if (cause instanceof Error) return cause;
  const message =
    typeof cause === "string" ? cause : "알 수 없는 오류가 발생했습니다.";
  return new Error(message, { cause });
}

export function toThrowable(error: AppError): Error {
  if ("_tag" in error) return unknownCauseToError(error.cause);
  return unknownCauseToError(error.cause ?? error.message);
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

type ResultAsyncValue<T> =
  T extends ResultAsync<infer TValue, AppError> ? TValue : never;

export function combineResults<
  const TResults extends ReadonlyArray<ResultAsync<unknown, AppError>>,
>(
  results: TResults,
): ResultAsync<
  { [K in keyof TResults]: ResultAsyncValue<TResults[K]> },
  AppError
> {
  const combined = ResultAsync.combine(
    results as ReadonlyArray<ResultAsync<unknown, AppError>>,
  );
  return combined as ResultAsync<
    { [K in keyof TResults]: ResultAsyncValue<TResults[K]> },
    AppError
  >;
}

export function validateWith<T>(
  predicate: (value: T) => boolean,
  errorFn: (value: T) => AppError,
): (value: T) => Result<T, AppError> {
  return (value: T) => (predicate(value) ? ok(value) : err(errorFn(value)));
}

export function internalError(
  message: string,
  details?: Record<string, unknown>,
) {
  return coreError({
    code: "INTERNAL_ERROR",
    message,
    details,
  });
}
