import { throwAppError } from "./result";

import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Result, ResultAsync } from "neverthrow";
import type { AppError } from "./result";

/**
 * ResultAsync 또는 Promise<Result>를 처리하는 통합 핸들러
 *
 * @example
 * // ResultAsync 사용
 * handleResult(someResultAsync, (value) => c.json(value));
 *
 * // Promise<Result> 사용 (Go 스타일 usecase)
 * handleResult(verifyGoogleOAuth(input, ctx), (value) => c.json(value));
 */
export async function handleResult<T, TResponse>(
  result: ResultAsync<T, AppError> | Promise<Result<T, AppError>>,
  onOk: (value: T) => TResponse | Promise<TResponse>,
): Promise<TResponse> {
  const awaited = await result;

  // ResultAsync는 await하면 Result가 됨
  // Promise<Result>도 await하면 Result가 됨
  if (awaited.isErr()) {
    throwAppError(awaited.error);
  }

  return onOk(awaited.value);
}

/**
 * @deprecated handleResult를 사용하세요
 */
export async function handleResultAsync<T, TResponse>(
  result: ResultAsync<T, AppError>,
  onOk: (value: T) => TResponse | Promise<TResponse>,
): Promise<TResponse> {
  return handleResult(result, onOk);
}

export function jsonResult<T, TStatus extends ContentfulStatusCode = 200>(
  c: Context,
  result: ResultAsync<T, AppError> | Promise<Result<T, AppError>>,
  status: TStatus = 200 as TStatus,
) {
  return handleResult(result, (value) => c.json(value, status));
}
