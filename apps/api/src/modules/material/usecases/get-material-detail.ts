import { err, ok, safeTry } from "neverthrow";

import { isoDate, isoDateRequired } from "../../../lib/utils/date";
import { parseOrInternalError } from "../../../lib/zod";
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
    return safeTry(async function* () {
      const material = yield* deps.materialRepository.findByIdForUser(
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

      const chunkCount = yield* deps.ragRetriever.countMaterialChunks({
        userId,
        materialId,
      });

      const response = yield* parseOrInternalError(
        GetMaterialDetailResponse,
        {
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
        },
        "GetMaterialDetailResponse",
      );

      return ok(response);
    });
  };
}
