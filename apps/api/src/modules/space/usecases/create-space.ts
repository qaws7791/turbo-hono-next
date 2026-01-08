import { err, ok } from "neverthrow";

import { generatePublicId } from "../../../lib/public-id";
import { ApiError } from "../../../middleware/error-handler";
import { CreateSpaceInput, CreateSpaceResponse } from "../space.dto";
import { spaceRepository } from "../space.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  CreateSpaceInput as CreateSpaceInputType,
  CreateSpaceResponse as CreateSpaceResponseType,
} from "../space.dto";

function isoDate(value: Date): string {
  return value.toISOString();
}

export async function createSpace(
  userId: string,
  input: CreateSpaceInputType,
): Promise<Result<CreateSpaceResponseType, AppError>> {
  // 1. 입력 검증
  const parseResult = CreateSpaceInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

  const now = new Date();

  // 2. Space 생성
  const insertResult = await spaceRepository.insert({
    publicId: generatePublicId(),
    userId,
    name: validated.name,
    description: validated.description ?? null,
    createdAt: now,
    updatedAt: now,
  });
  if (insertResult.isErr()) return err(insertResult.error);
  const space = insertResult.value;

  if (!space) {
    return err(
      new ApiError(500, "SPACE_CREATE_FAILED", "Space 생성에 실패했습니다."),
    );
  }

  return ok(
    CreateSpaceResponse.parse({
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
