import { coreError } from "./core-error";

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
      throw coreError({
        code: "INTERNAL_ERROR",
        message: "알 수 없는 오류입니다.",
      });
    }
    throw coreError({
      code: error.code,
      message: error.message,
      details: { status: error.status },
    });
  };
}
