import { err, ok, safeTry } from "neverthrow";

import { isoDate, isoDateRequired } from "../../../../common/date";
import { coreError } from "../../../../common/core-error";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { GetMaterialDetailResponse as GetMaterialDetailResponseType } from "../../api/schema";
import type { RagRetrieverForMaterialPort } from "../../api/ports";
import type { MaterialRepository } from "../infrastructure/material.repository";

export function getMaterialDetail(deps: {
  readonly materialRepository: MaterialRepository;
  readonly ragRetriever: RagRetrieverForMaterialPort;
}) {
  return function getMaterialDetail(
    userId: string,
    materialId: string,
  ): ResultAsync<GetMaterialDetailResponseType, AppError> {
    return safeTry(async function* () {
      const material = yield* deps.materialRepository.findByIdForUser(
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

      const chunkCount = yield* deps.ragRetriever.countMaterialChunks({
        userId,
        materialId,
      });

      return ok({
        data: {
          id: material.id,
          title: material.title,
          originalFilename: material.originalFilename ?? null,
          mimeType: material.mimeType ?? null,
          fileSize: material.fileSize ?? null,
          processingStatus: material.processingStatus,
          processingProgress: material.processingProgress ?? null,
          processingStep: material.processingStep ?? null,
          processingError: material.errorMessage ?? null,
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
