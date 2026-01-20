import { err, ok, safeTry } from "neverthrow";

import { fromPromise } from "../../../lib/result";
import { parseOrInternalError } from "../../../lib/zod";
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
    return safeTry(async function* () {
      const material = yield* deps.materialRepository.findForDelete(
        userId,
        materialId,
      );
      if (!material || material.deletedAt) {
        return err(
          new ApiError(404, "MATERIAL_NOT_FOUND", "자료를 찾을 수 없습니다.", {
            materialId,
          }),
        );
      }

      const hasRefs =
        yield* deps.materialRepository.hasPlanReferences(materialId);
      if (hasRefs) {
        const now = new Date();
        yield* deps.materialRepository.softDelete(materialId, now);

        const response = yield* parseOrInternalError(
          DeleteMaterialResponse,
          {
            message:
              "목록에서 삭제되었습니다. (진행 중인 학습을 위해 데이터는 유지됩니다.)",
            data: { type: "soft" as const },
          },
          "DeleteMaterialResponse",
        );
        return ok(response);
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

      const response = yield* parseOrInternalError(
        DeleteMaterialResponse,
        {
          message: "삭제되었습니다.",
          data: { type: "hard" as const },
        },
        "DeleteMaterialResponse",
      );

      return ok(response);
    });
  };
}
