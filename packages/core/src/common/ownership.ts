import { err, ok } from "neverthrow";

import { coreError } from "./core-error";

import type { Result } from "neverthrow";
import type { CoreError } from "./core-error";

export interface OwnedEntity {
  userId: string;
}

export function assertOwnership<T extends OwnedEntity>(
  entity: T | null,
  userId: string,
  entityName: string = "리소스",
): Result<T, CoreError> {
  if (!entity) {
    return err(
      coreError({
        code: "NOT_FOUND",
        message: `${entityName}을(를) 찾을 수 없습니다.`,
      }),
    );
  }
  if (entity.userId !== userId) {
    return err(
      coreError({
        code: "FORBIDDEN",
        message: `${entityName}에 접근할 권한이 없습니다.`,
      }),
    );
  }
  return ok(entity);
}
