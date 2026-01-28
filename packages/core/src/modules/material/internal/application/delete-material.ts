import { err, ok, safeTry } from "neverthrow";

import { coreError } from "../../../../common/core-error";
import { fromPromise } from "../../../../common/result";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { DeleteMaterialResponse as DeleteMaterialResponseType } from "../../api/schema";
import type {
  R2StoragePort,
  RagVectorStoreManagerForMaterialPort,
} from "../../api/ports";
import type { MaterialRepository } from "../infrastructure/material.repository";

export function deleteMaterial(deps: {
  readonly materialRepository: MaterialRepository;
  readonly ragVectorStoreManager: RagVectorStoreManagerForMaterialPort;
  readonly r2: R2StoragePort;
}) {
  return function deleteMaterial(
    userId: string,
    materialId: string,
  ): ResultAsync<DeleteMaterialResponseType, AppError> {
    return safeTry(async function* () {
      const material = yield* deps.materialRepository.findForDelete(
        userId,
        materialId,
      );
      if (!material || material.deletedAt) {
        return err(
          coreError({
            code: "MATERIAL_NOT_FOUND",
            message: "자료를 찾을 수 없습니다.",
            details: { materialId },
          }),
        );
      }

      const hasRefs =
        yield* deps.materialRepository.hasPlanReferences(materialId);
      if (hasRefs) {
        const now = new Date();
        yield* deps.materialRepository.softDelete(materialId, now);

        return ok({
          message:
            "목록에서 삭제되었습니다. (진행 중인 학습을 위해 데이터는 유지됩니다.)",
          data: { type: "soft" as const },
        });
      }

      if (material.storageProvider === "R2" && material.storageKey) {
        yield* deps.r2.deleteObject({ key: material.storageKey });
      }

      const store = yield* fromPromise(
        deps.ragVectorStoreManager.getStoreForUser({
          userId,
        }),
      );
      yield* fromPromise(
        store.delete({
          filter: {
            userId,
            materialId,
          },
        }),
      );

      yield* deps.materialRepository.hardDelete(materialId);

      return ok({
        message: "삭제되었습니다.",
        data: { type: "hard" as const },
      });
    });
  };
}
