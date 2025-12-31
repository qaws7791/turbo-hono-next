import { err, ok } from "neverthrow";

import { getVectorStoreForSpace } from "../../../ai/rag/vector-store";
import { deleteObject } from "../../../lib/r2";
import { ApiError } from "../../../middleware/error-handler";
import { assertSpaceOwned } from "../../space";
import { DeleteMaterialResponse } from "../material.dto";
import { materialRepository } from "../material.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { DeleteMaterialResponse as DeleteMaterialResponseType } from "../material.dto";

export async function deleteMaterial(
  userId: string,
  materialId: string,
): Promise<Result<DeleteMaterialResponseType, AppError>> {
  // 1. Material 조회
  const materialResult = await materialRepository.findForDelete(
    userId,
    materialId,
  );
  if (materialResult.isErr()) return err(materialResult.error);
  const material = materialResult.value;

  if (!material || material.deletedAt) {
    return err(
      new ApiError(404, "MATERIAL_NOT_FOUND", "자료를 찾을 수 없습니다.", {
        materialId,
      }),
    );
  }

  // 2. Space 소유권 확인
  const spaceResult = await assertSpaceOwned(userId, material.spaceId);
  if (spaceResult.isErr()) return err(spaceResult.error);

  // 3. Plan 참조 확인
  const hasRefsResult = await materialRepository.hasPlanReferences(materialId);
  if (hasRefsResult.isErr()) return err(hasRefsResult.error);
  const hasRefs = hasRefsResult.value;

  // 4. 참조가 있으면 소프트 삭제
  if (hasRefs) {
    const now = new Date();
    const softDeleteResult = await materialRepository.softDelete(
      materialId,
      now,
    );
    if (softDeleteResult.isErr()) return err(softDeleteResult.error);

    return ok(
      DeleteMaterialResponse.parse({
        message:
          "목록에서 삭제되었습니다. (진행 중인 학습을 위해 데이터는 유지됩니다.)",
        data: { type: "soft" as const },
      }),
    );
  }

  // 5. 스토리지 삭제 (R2인 경우)
  if (material.storageProvider === "R2" && material.storageKey) {
    await deleteObject({ key: material.storageKey });
  }

  // 5.5. 벡터 인덱스 삭제
  const store = await getVectorStoreForSpace({ spaceId: material.spaceId });
  await store.delete({
    filter: {
      userId,
      spaceId: String(material.spaceId),
      materialId,
    },
  });

  // 6. 하드 삭제
  const hardDeleteResult = await materialRepository.hardDelete(materialId);
  if (hardDeleteResult.isErr()) return err(hardDeleteResult.error);

  return ok(
    DeleteMaterialResponse.parse({
      message: "삭제되었습니다.",
      data: { type: "hard" as const },
    }),
  );
}
