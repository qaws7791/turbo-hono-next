import { ApiError } from "../middleware/error-handler";

import type { ContentfulStatusCode } from "hono/utils/http-status";

export interface ErrorDefinition {
  readonly status: ContentfulStatusCode;
  readonly code: string;
  readonly message: string;
}

export function createErrorThrower<T extends Record<string, ErrorDefinition>>(
  errors: T,
): (key: keyof T) => never {
  return function throwError(key: keyof T): never {
    const error = errors[key];
    if (!error) {
      throw new ApiError(500, "INTERNAL_ERROR", "알 수 없는 오류입니다.");
    }
    throw new ApiError(error.status, error.code, error.message);
  };
}
