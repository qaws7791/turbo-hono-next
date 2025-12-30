import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { spaceRepository } from "../space.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { SpaceEntity } from "../space.repository";

export async function assertSpaceOwned(
  userId: string,
  spaceId: string | number,
): Promise<Result<SpaceEntity, AppError>> {
  // 1. Space 조회
  const spaceResult = await spaceRepository.findByIdOrPublicId(spaceId);
  if (spaceResult.isErr()) return err(spaceResult.error);
  const space = spaceResult.value;

  // 2. 존재 여부 및 삭제 상태 확인
  if (!space || space.deletedAt) {
    return err(
      new ApiError(404, "SPACE_NOT_FOUND", "Space를 찾을 수 없습니다.", {
        spaceId,
      }),
    );
  }

  // 3. 소유권 확인
  if (space.userId !== userId) {
    return err(
      new ApiError(
        403,
        "SPACE_ACCESS_DENIED",
        "이 Space에 접근할 수 없습니다.",
        { spaceId },
      ),
    );
  }

  return ok(space);
}
