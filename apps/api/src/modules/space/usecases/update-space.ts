import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { UpdateSpaceInput, UpdateSpaceResponse } from "../space.dto";
import { spaceRepository } from "../space.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  UpdateSpaceInput as UpdateSpaceInputType,
  UpdateSpaceResponse as UpdateSpaceResponseType,
} from "../space.dto";

function isoDate(value: Date): string {
  return value.toISOString();
}

export async function updateSpace(
  userId: string,
  spaceId: string,
  input: UpdateSpaceInputType,
): Promise<Result<UpdateSpaceResponseType, AppError>> {
  // 1. 입력 검증
  const parseResult = UpdateSpaceInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

  const now = new Date();

  // 2. 업데이트 데이터 구성
  const updates: Partial<Parameters<typeof spaceRepository.update>[2]> = {
    updatedAt: now,
  };
  if (validated.name !== undefined) updates.name = validated.name;
  if (validated.description !== undefined) {
    updates.description = validated.description;
  }
  if (validated.icon !== undefined) updates.icon = validated.icon;
  if (validated.color !== undefined) updates.color = validated.color;

  // 3. Space 업데이트
  const updateResult = await spaceRepository.update(userId, spaceId, updates);
  if (updateResult.isErr()) return err(updateResult.error);
  const space = updateResult.value;

  if (!space) {
    return err(
      new ApiError(404, "SPACE_NOT_FOUND", "Space를 찾을 수 없습니다.", {
        spaceId,
      }),
    );
  }

  return ok(
    UpdateSpaceResponse.parse({
      data: {
        id: space.id,
        name: space.name,
        description: space.description ?? null,
        icon: space.icon ?? null,
        color: space.color ?? null,
        createdAt: isoDate(space.createdAt),
        updatedAt: isoDate(space.updatedAt),
      },
    }),
  );
}
