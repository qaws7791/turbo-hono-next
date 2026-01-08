import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { GetSpaceResponse } from "../space.dto";
import { spaceRepository } from "../space.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { GetSpaceResponse as GetSpaceResponseType } from "../space.dto";

function isoDate(value: Date): string {
  return value.toISOString();
}

export async function getSpace(
  userId: string,
  spaceId: string,
): Promise<Result<GetSpaceResponseType, AppError>> {
  // 1. Space 조회
  const spaceResult = await spaceRepository.findByPublicId(spaceId);
  if (spaceResult.isErr()) return err(spaceResult.error);
  const space = spaceResult.value;

  if (!space || space.deletedAt || space.userId !== userId) {
    return err(
      new ApiError(404, "SPACE_NOT_FOUND", "Space를 찾을 수 없습니다.", {
        spaceId,
      }),
    );
  }

  return ok(
    GetSpaceResponse.parse({
      data: {
        id: space.id,
        name: space.name,
        description: space.description ?? null,
        icon: space.icon,
        color: space.color,
        createdAt: isoDate(space.createdAt),
        updatedAt: isoDate(space.updatedAt),
      },
    }),
  );
}
