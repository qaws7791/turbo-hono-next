import { tryPromise, unwrap } from "../../../lib/result";
import { isoDate, isoDateRequired } from "../../../lib/utils/date";
import { ApiError } from "../../../middleware/error-handler";
import { GetMaterialDetailResponse } from "../material.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { GetMaterialDetailResponse as GetMaterialDetailResponseType } from "../material.dto";
import type { RagRetrieverForMaterialPort } from "../material.ports";
import type { MaterialRepository } from "../material.repository";

export function getMaterialDetail(deps: {
  readonly materialRepository: MaterialRepository;
  readonly ragRetriever: RagRetrieverForMaterialPort;
}) {
  return function getMaterialDetail(
    userId: string,
    materialId: string,
  ): ResultAsync<GetMaterialDetailResponseType, AppError> {
    return tryPromise(async () => {
      const material = await unwrap(
        deps.materialRepository.findByIdForUser(userId, materialId),
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

      const chunkCount = await unwrap(
        deps.ragRetriever.countMaterialChunks({ userId, materialId }),
      );

      return GetMaterialDetailResponse.parse({
        data: {
          id: material.id,
          title: material.title,
          sourceType: material.sourceType,
          originalFilename: material.originalFilename ?? null,
          mimeType: material.mimeType ?? null,
          fileSize: material.fileSize ?? null,
          processingStatus: material.processingStatus,
          processedAt: isoDate(material.processedAt),
          summary: material.summary ?? null,
          chunkCount,
          createdAt: isoDateRequired(material.createdAt),
          updatedAt: isoDateRequired(material.updatedAt),
        },
      });
    });
  };
}
