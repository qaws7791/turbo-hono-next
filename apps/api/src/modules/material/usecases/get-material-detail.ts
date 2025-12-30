import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { assertSpaceOwned } from "../../space";
import { GetMaterialDetailResponse } from "../material.dto";
import { materialRepository } from "../material.repository";
import { isoDate, isoDateRequired } from "../material.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { GetMaterialDetailResponse as GetMaterialDetailResponseType } from "../material.dto";

export async function getMaterialDetail(
  userId: string,
  materialId: string,
): Promise<Result<GetMaterialDetailResponseType, AppError>> {
  // 1. Material 조회
  const materialResult = await materialRepository.findByIdForUser(
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
  const space = spaceResult.value;

  // 3. 청크 수 조회
  const chunkCountResult = await materialRepository.countChunks(materialId);
  if (chunkCountResult.isErr()) return err(chunkCountResult.error);
  const chunkCount = chunkCountResult.value;

  // 4. 태그 맵 조회
  const tagMapResult = await materialRepository.getTagMap([materialId]);
  if (tagMapResult.isErr()) return err(tagMapResult.error);
  const tagMap = tagMapResult.value;

  return ok(
    GetMaterialDetailResponse.parse({
      data: {
        id: material.id,
        spaceId: space.publicId,
        title: material.title,
        sourceType: material.sourceType,
        originalFilename: material.originalFilename ?? null,
        mimeType: material.mimeType ?? null,
        fileSize: material.fileSize ?? null,
        processingStatus: material.processingStatus,
        processedAt: isoDate(material.processedAt),
        summary: material.summary ?? null,
        tags: tagMap.get(materialId) ?? [],
        chunkCount,
        createdAt: isoDateRequired(material.createdAt),
        updatedAt: isoDateRequired(material.updatedAt),
      },
    }),
  );
}
