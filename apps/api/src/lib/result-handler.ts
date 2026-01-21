import { throwAppError } from "./result";

import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ResultAsync } from "neverthrow";
import type { AppError } from "./result";

/**
 * ResultAsync를 처리하는 통합 핸들러
 *
 * @example
 * handleResult(someResultAsync, (value) => c.json(value));
 */
export async function handleResult<T, TResponse>(
  result: ResultAsync<T, AppError>,
  onOk: (value: T) => TResponse | Promise<TResponse>,
): Promise<TResponse> {
  const awaited = await result;
  if (awaited.isErr()) {
    throwAppError(awaited.error);
  }

  return await onOk(awaited.value);
}

export function jsonResult<T, TStatus extends ContentfulStatusCode = 200>(
  c: Context,
  result: ResultAsync<T, AppError>,
  status: TStatus = 200 as TStatus,
) {
  return handleResult(result, (value) => c.json(value, status));
}
