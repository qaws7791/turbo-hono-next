import { ApiError } from "../middleware/error-handler";

export interface OwnedEntity {
  userId: string;
}

export function assertOwnership<T extends OwnedEntity>(
  entity: T | null,
  userId: string,
  entityName: string = "리소스",
): asserts entity is T {
  if (!entity) {
    throw new ApiError(
      404,
      "NOT_FOUND",
      `${entityName}을(를) 찾을 수 없습니다.`,
    );
  }
  if (entity.userId !== userId) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      `${entityName}에 접근할 권한이 없습니다.`,
    );
  }
}
