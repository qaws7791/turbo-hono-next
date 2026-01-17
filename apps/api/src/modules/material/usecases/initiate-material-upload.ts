import { tryPromise, unwrap } from "../../../lib/result";
import { ApiError } from "../../../middleware/error-handler";
import { InitiateMaterialUploadResponse } from "../material.dto";
import { MAX_FILE_BYTES } from "../material.utils";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  InitiateMaterialUploadInput as InitiateMaterialUploadInputType,
  InitiateMaterialUploadResponse as InitiateMaterialUploadResponseType,
} from "../material.dto";
import type { DocumentParserPort, R2StoragePort } from "../material.ports";
import type { MaterialRepository } from "../material.repository";

function getSafeExt(originalFilename: string): string | null {
  const idx = originalFilename.lastIndexOf(".");
  if (idx === -1) return null;
  const ext = originalFilename.slice(idx + 1).toLowerCase();
  if (!/^[a-z0-9]{1,10}$/.test(ext)) return null;
  return ext;
}

function buildTempObjectKey(params: {
  readonly userId: string;
  readonly uploadId: string;
  readonly originalFilename: string;
  readonly now: Date;
}): string {
  const yyyy = String(params.now.getUTCFullYear());
  const mm = String(params.now.getUTCMonth() + 1).padStart(2, "0");
  const ext = getSafeExt(params.originalFilename);
  const suffix = ext ? `.${ext}` : "";
  return `tmp/materials/${params.userId}/${yyyy}/${mm}/${params.uploadId}${suffix}`;
}

export function initiateMaterialUpload(deps: {
  readonly materialRepository: MaterialRepository;
  readonly documentParser: DocumentParserPort;
  readonly r2: R2StoragePort;
}) {
  return function initiateMaterialUpload(
    userId: string,
    input: InitiateMaterialUploadInputType,
  ): ResultAsync<InitiateMaterialUploadResponseType, AppError> {
    return tryPromise(async () => {
      const originalFilename = input.originalFilename.trim();
      const mimeType = input.mimeType.trim();

      if (input.fileSize > MAX_FILE_BYTES) {
        throw new ApiError(
          400,
          "MATERIAL_FILE_TOO_LARGE",
          "파일 크기가 너무 큽니다.",
          {
            maxBytes: MAX_FILE_BYTES,
          },
        );
      }

      if (
        !deps.documentParser.isSupportedMaterialFile({
          mimeType,
          originalFilename,
        })
      ) {
        throw new ApiError(
          400,
          "MATERIAL_UNSUPPORTED_TYPE",
          "지원하지 않는 파일 형식입니다.",
          { mimeType, originalFilename },
        );
      }

      const now = new Date();
      const uploadId = crypto.randomUUID();
      const expiresInSeconds = 300;
      const expiresAt = new Date(now.getTime() + expiresInSeconds * 1000);
      const objectKey = buildTempObjectKey({
        userId,
        uploadId,
        originalFilename,
        now,
      });

      await unwrap(
        deps.materialRepository.insertUploadSession({
          id: uploadId,
          userId,
          status: "INITIATED",
          expiresAt,
          objectKey,
          mimeType,
          fileSize: input.fileSize,
          originalFilename,
          createdAt: now,
          updatedAt: now,
        }),
      );

      const { url } = await deps.r2.createPresignedPutUrl({
        key: objectKey,
        contentType: mimeType,
        expiresInSeconds,
      });

      return InitiateMaterialUploadResponse.parse({
        data: {
          uploadId,
          objectKey,
          uploadUrl: url,
          method: "PUT",
          headers: {
            "Content-Type": mimeType,
          },
          expiresAt: expiresAt.toISOString(),
        },
      });
    });
  };
}
