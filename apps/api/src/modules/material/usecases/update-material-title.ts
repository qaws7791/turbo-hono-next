import { err, ok, safeTry } from "neverthrow";

import { isoDateRequired } from "../../../lib/utils/date";
import { parseOrInternalError } from "../../../lib/zod";
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
    return safeTry(async function* () {
      const updatedAt = new Date();

      const row = yield* deps.materialRepository.updateTitle(
        userId,
        materialId,
        title,
        updatedAt,
      );
      if (!row) {
        return err(
          new ApiError(404, "MATERIAL_NOT_FOUND", "자료를 찾을 수 없습니다.", {
            materialId,
          }),
        );
      }

      const response = yield* parseOrInternalError(
        UpdateMaterialTitleResponse,
        {
          data: {
            id: row.id,
            title: row.title,
            updatedAt: isoDateRequired(row.updatedAt),
          },
        },
        "UpdateMaterialTitleResponse",
      );

      return ok(response);
    });
  };
}
