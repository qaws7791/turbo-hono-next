import { err, ok } from "neverthrow";

import { isSupportedMaterialFile } from "../../../ai/ingestion/parse";
import { createPresignedPutUrl } from "../../../lib/r2";
import { ApiError } from "../../../middleware/error-handler";
import { assertSpaceOwned } from "../../space";
import {
  InitiateMaterialUploadInput,
  InitiateMaterialUploadResponse,
} from "../material.dto";
import { materialRepository } from "../material.repository";
import { MAX_FILE_BYTES } from "../material.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { InitiateMaterialUploadResponse as InitiateMaterialUploadResponseType } from "../material.dto";

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

export async function initiateMaterialUpload(
  userId: string,
  spaceId: string,
  input: unknown,
): Promise<Result<InitiateMaterialUploadResponseType, AppError>> {
  // 1. 입력 검증
  const parseResult = InitiateMaterialUploadInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

  // 2. Space 소유권 확인
  const spaceResult = await assertSpaceOwned(userId, spaceId);
  if (spaceResult.isErr()) return err(spaceResult.error);
  const space = spaceResult.value;

  const originalFilename = validated.originalFilename.trim();
  const mimeType = validated.mimeType.trim();

  // 3. 파일 크기 검증
  if (validated.fileSize > MAX_FILE_BYTES) {
    return err(
      new ApiError(400, "MATERIAL_FILE_TOO_LARGE", "파일 크기가 너무 큽니다.", {
        maxBytes: MAX_FILE_BYTES,
      }),
    );
  }

  // 4. 파일 형식 검증
  if (!isSupportedMaterialFile({ mimeType, originalFilename })) {
    return err(
      new ApiError(
        400,
        "MATERIAL_UNSUPPORTED_TYPE",
        "지원하지 않는 파일 형식입니다.",
        { mimeType, originalFilename },
      ),
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

  // 5. 업로드 세션 생성
  const insertResult = await materialRepository.insertUploadSession({
    id: uploadId,
    userId,
    spaceId: space.id,
    status: "INITIATED",
    expiresAt,
    objectKey,
    mimeType,
    fileSize: validated.fileSize,
    originalFilename,
    createdAt: now,
    updatedAt: now,
  });
  if (insertResult.isErr()) return err(insertResult.error);

  // 6. Presigned URL 생성
  const { url } = await createPresignedPutUrl({
    key: objectKey,
    contentType: mimeType,
    expiresInSeconds,
  });

  return ok(
    InitiateMaterialUploadResponse.parse({
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
    }),
  );
}
