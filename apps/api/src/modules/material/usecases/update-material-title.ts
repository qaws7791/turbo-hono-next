import { err, ok } from "neverthrow";
import { z } from "zod";

import { ApiError } from "../../../middleware/error-handler";
import { UpdateMaterialTitleResponse } from "../material.dto";
import { materialRepository } from "../material.repository";
import { isoDateRequired } from "../material.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { UpdateMaterialTitleResponse as UpdateMaterialTitleResponseType } from "../material.dto";

const MaterialTitle = z.string().min(1).max(200);

export async function updateMaterialTitle(
  userId: string,
  materialId: string,
  title: string,
): Promise<Result<UpdateMaterialTitleResponseType, AppError>> {
  const updatedAt = new Date();

  // 1. 입력 검증
  const parseResult = MaterialTitle.safeParse(title);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validatedTitle = parseResult.data;

  // 2. 제목 업데이트
  const updateResult = await materialRepository.updateTitle(
    userId,
    materialId,
    validatedTitle,
    updatedAt,
  );
  if (updateResult.isErr()) return err(updateResult.error);
  const row = updateResult.value;

  if (!row) {
    return err(
      new ApiError(404, "MATERIAL_NOT_FOUND", "자료를 찾을 수 없습니다.", {
        materialId,
      }),
    );
  }

  return ok(
    UpdateMaterialTitleResponse.parse({
      data: {
        id: row.id,
        title: row.title,
        updatedAt: isoDateRequired(row.updatedAt),
      },
    }),
  );
}
