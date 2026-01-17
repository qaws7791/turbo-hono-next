import { tryPromise, unwrap } from "../../../lib/result";
import { ApiError } from "../../../middleware/error-handler";
import { DeleteMaterialResponse } from "../material.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { DeleteMaterialResponse as DeleteMaterialResponseType } from "../material.dto";
import type {
  R2StoragePort,
  RagVectorStoreManagerForMaterialPort,
} from "../material.ports";
import type { MaterialRepository } from "../material.repository";

export function deleteMaterial(deps: {
  readonly materialRepository: MaterialRepository;
  readonly ragVectorStoreManager: RagVectorStoreManagerForMaterialPort;
  readonly r2: R2StoragePort;
}) {
  return function deleteMaterial(
    userId: string,
    materialId: string,
  ): ResultAsync<DeleteMaterialResponseType, AppError> {
    return tryPromise(async () => {
      const material = await unwrap(
        deps.materialRepository.findForDelete(userId, materialId),
      );

      if (!material || material.deletedAt) {
        throw new ApiError(
          404,
          "MATERIAL_NOT_FOUND",
          "자료를 찾을 수 없습니다.",
          {
            materialId,
          },
        );
      }

      const hasRefs = await unwrap(
        deps.materialRepository.hasPlanReferences(materialId),
      );

      if (hasRefs) {
        const now = new Date();
        await unwrap(deps.materialRepository.softDelete(materialId, now));

        return DeleteMaterialResponse.parse({
          message:
            "목록에서 삭제되었습니다. (진행 중인 학습을 위해 데이터는 유지됩니다.)",
          data: { type: "soft" as const },
        });
      }

      if (material.storageProvider === "R2" && material.storageKey) {
        await deps.r2.deleteObject({ key: material.storageKey });
      }

      const store = await deps.ragVectorStoreManager.getStoreForUser({
        userId,
      });
      await store.delete({
        filter: {
          userId,
          materialId,
        },
      });

      await unwrap(deps.materialRepository.hardDelete(materialId));

      return DeleteMaterialResponse.parse({
        message: "삭제되었습니다.",
        data: { type: "hard" as const },
      });
    });
  };
}
