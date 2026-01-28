import { err, ok, safeTry } from "neverthrow";

import { isoDateRequired } from "../../../../common/date";
import { coreError } from "../../../../common/core-error";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { UpdateMaterialTitleResponse as UpdateMaterialTitleResponseType } from "../../api/schema";
import type { MaterialRepository } from "../infrastructure/material.repository";

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
          coreError({
            code: "MATERIAL_NOT_FOUND",
            message: "자료를 찾을 수 없습니다.",
            details: { materialId },
          }),
        );
      }

      return ok({
        data: {
          id: row.id,
          title: row.title,
          updatedAt: isoDateRequired(row.updatedAt),
        },
      });
    });
  };
}
