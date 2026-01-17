import { tryPromise, unwrap } from "../../../lib/result";
import { isoDateRequired } from "../../../lib/utils/date";
import { ApiError } from "../../../middleware/error-handler";
import { UpdateMaterialTitleResponse } from "../material.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { UpdateMaterialTitleResponse as UpdateMaterialTitleResponseType } from "../material.dto";
import type { MaterialRepository } from "../material.repository";

export function updateMaterialTitle(deps: {
  readonly materialRepository: MaterialRepository;
}) {
  return function updateMaterialTitle(
    userId: string,
    materialId: string,
    title: string,
  ): ResultAsync<UpdateMaterialTitleResponseType, AppError> {
    return tryPromise(async () => {
      const updatedAt = new Date();

      const row = await unwrap(
        deps.materialRepository.updateTitle(
          userId,
          materialId,
          title,
          updatedAt,
        ),
      );

      if (!row) {
        throw new ApiError(
          404,
          "MATERIAL_NOT_FOUND",
          "자료를 찾을 수 없습니다.",
          {
            materialId,
          },
        );
      }

      return UpdateMaterialTitleResponse.parse({
        data: {
          id: row.id,
          title: row.title,
          updatedAt: isoDateRequired(row.updatedAt),
        },
      });
    });
  };
}
