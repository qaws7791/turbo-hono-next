import { ResultAsync, err, ok } from "neverthrow";
import { isCoreError } from "@repo/core/common/core-error";

import { ApiError } from "../middleware/error-handler";

import type { Result } from "neverthrow";
import type { CoreError } from "@repo/core/common/core-error";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export type UnknownError = {
  readonly _tag: "UnknownError";
  readonly cause: unknown;
};

export type AppError = ApiError | CoreError | UnknownError;

export function unknownError(cause: unknown): UnknownError {
  return { _tag: "UnknownError", cause };
}

export function toAppError(cause: unknown): AppError {
  if (cause instanceof ApiError) return cause;
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
  if (error instanceof ApiError) return error;
  if (!("_tag" in error)) {
    const status = coreErrorCodeToStatus(error.code);
    return new ApiError(status, error.code, error.message, {
      ...error.details,
      cause: error.cause,
    });
  }
  return unknownCauseToError(error.cause);
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

function coreErrorCodeToStatus(code: string): ContentfulStatusCode {
  if (code === "FORBIDDEN") return 403;
  if (code === "UNAUTHORIZED") return 401;
  if (code === "QUEUE_UNAVAILABLE") return 503;
  if (code === "QUEUE_ADD_FAILED") return 503;

  if (code === "INVALID_REQUEST" || code === "VALIDATION_ERROR") return 400;

  if (code.endsWith("_NOT_FOUND")) return 404;

  // Domain-specific "bad request" style codes
  if (code.endsWith("_NOT_READY")) return 400;
  if (code.endsWith("_ALREADY_EXISTS")) return 409;
  if (code.endsWith("_ALREADY_COMPLETED")) return 409;
  if (code.endsWith("_DUPLICATE")) return 409;
  if (code.endsWith("_EXPIRED")) return 410;

  // Auth
  if (code === "INVALID_REDIRECT") return 400;
  if (code.startsWith("MAGIC_LINK_")) return 400;
  if (code === "GOOGLE_EMAIL_NOT_VERIFIED") return 400;
  if (code === "GOOGLE_OAUTH_NOT_CONFIGURED") return 500;
  if (code === "GOOGLE_ID_TOKEN_MISSING") return 502;
  if (code === "GOOGLE_TOKEN_EXCHANGE_FAILED") return 502;
  if (code === "GOOGLE_USERINFO_FAILED" || code === "GOOGLE_USERINFO_INVALID")
    return 502;
  if (code.startsWith("GOOGLE_ID_TOKEN_")) return 401;

  // Materials
  if (code === "MATERIAL_FILE_TOO_LARGE") return 400;
  if (code === "MATERIAL_UNSUPPORTED_TYPE") return 400;
  if (code === "UPLOAD_INVALID_STATE") return 500;
  if (code.startsWith("UPLOAD_")) return 400;

  return 500;
}
