import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { DeleteSpaceResponse } from "../space.dto";
import { spaceRepository } from "../space.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { DeleteSpaceResponse as DeleteSpaceResponseType } from "../space.dto";

export async function deleteSpace(
  userId: string,
  spaceId: string,
): Promise<Result<DeleteSpaceResponseType, AppError>> {
  const now = new Date();

  // 1. Space 소프트 삭제
  const deleteResult = await spaceRepository.softDelete(userId, spaceId, now);
  if (deleteResult.isErr()) return err(deleteResult.error);
  const deleted = deleteResult.value;

  if (!deleted) {
    return err(
      new ApiError(404, "SPACE_NOT_FOUND", "Space를 찾을 수 없습니다.", {
        spaceId,
      }),
    );
  }

  return ok(DeleteSpaceResponse.parse({ message: "Space가 삭제되었습니다." }));
}
