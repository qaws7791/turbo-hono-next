import { createHash } from "node:crypto";

import { inferMaterialSourceTypeFromFile } from "../../../ai/ingestion/parse";
import { ingestMaterial } from "../../../ai/rag/ingest";
import {
  copyObject,
  deleteObject,
  getObjectBytes,
  headObject,
} from "../../../lib/r2";
import { throwAppError, tryPromise } from "../../../lib/result";
import { ApiError } from "../../../middleware/error-handler";
import {
  CompleteMaterialUploadInput,
  CreateMaterialResult,
} from "../material.dto";
import { materialRepository } from "../material.repository";

import type { Result, ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { CreateMaterialResult as CreateMaterialResultType } from "../material.dto";

function normalizeEtag(value: string): string {
  return value.trim().replaceAll('"', "");
}

function getHttpStatusCode(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;
  const metadata = (error as { $metadata?: unknown }).$metadata;
  if (!metadata || typeof metadata !== "object") return null;
  const httpStatusCode = (metadata as { httpStatusCode?: unknown })
    .httpStatusCode;
  return typeof httpStatusCode === "number" ? httpStatusCode : null;
}

function getSafeExt(originalFilename: string | null): string | null {
  if (!originalFilename) return null;
  const idx = originalFilename.lastIndexOf(".");
  if (idx === -1) return null;
  const ext = originalFilename.slice(idx + 1).toLowerCase();
  if (!/^[a-z0-9]{1,10}$/.test(ext)) return null;
  return ext;
}

function buildFinalObjectKey(params: {
  readonly userId: string;
  readonly materialId: string;
  readonly originalFilename: string | null;
  readonly now: Date;
}): string {
  const yyyy = String(params.now.getUTCFullYear());
  const mm = String(params.now.getUTCMonth() + 1).padStart(2, "0");
  const ext = getSafeExt(params.originalFilename);
  const suffix = ext ? `.${ext}` : "";
  return `materials/${params.userId}/${yyyy}/${mm}/${params.materialId}${suffix}`;
}

function normalizeMimeType(value: string | null): string | null {
  if (!value) return null;
  return value.split(";")[0]?.trim().toLowerCase() ?? null;
}

function inferTitle(params: {
  readonly title: string | undefined;
  readonly titleHint: string | null;
  readonly originalFilename: string | null;
}): string {
  return (
    params.title?.trim() ||
    params.titleHint ||
    params.originalFilename ||
    "Untitled"
  );
}

async function unwrap<T>(
  result: ResultAsync<T, AppError> | Promise<Result<T, AppError>>,
): Promise<T> {
  const awaited = await result;
  if (awaited.isErr()) {
    throwAppError(awaited.error);
  }
  return awaited.value;
}

export function completeMaterialUpload(
  userId: string,
  input: unknown,
): ResultAsync<CreateMaterialResultType, AppError> {
  return tryPromise(async () => {
    const validated = CompleteMaterialUploadInput.parse(input);

    const session = await unwrap(
      materialRepository.findUploadSessionByIdForUser(
        validated.uploadId,
        userId,
      ),
    );

    if (!session) {
      throw new ApiError(
        404,
        "UPLOAD_NOT_FOUND",
        "업로드 세션을 찾을 수 없습니다.",
        {
          uploadId: validated.uploadId,
        },
      );
    }

    if (session.status === "COMPLETED") {
      throw new ApiError(
        409,
        "UPLOAD_ALREADY_COMPLETED",
        "이미 완료된 업로드입니다.",
        { uploadId: session.id, materialId: session.materialId },
      );
    }

    const now = new Date();
    if (session.expiresAt.getTime() <= now.getTime()) {
      await unwrap(
        materialRepository.updateUploadSession(session.id, {
          status: "EXPIRED",
          errorMessage: "업로드 세션이 만료되었습니다.",
        }),
      );
      throw new ApiError(
        410,
        "UPLOAD_EXPIRED",
        "업로드 세션이 만료되었습니다.",
        {
          uploadId: session.id,
        },
      );
    }

    const expectedMimeType = normalizeMimeType(session.mimeType);
    if (!expectedMimeType) {
      throw new ApiError(
        500,
        "UPLOAD_INVALID_STATE",
        "업로드 정보가 올바르지 않습니다.",
      );
    }

    let tempBytes: Uint8Array | null = null;
    let finalObjectKey: string | null = null;
    let materialId: string | null = null;
    try {
      const head = await (async () => {
        try {
          return await headObject({ key: session.objectKey });
        } catch (error) {
          if (getHttpStatusCode(error) === 404) {
            throw new ApiError(
              400,
              "UPLOAD_OBJECT_NOT_FOUND",
              "업로드된 파일을 찾을 수 없습니다.",
              { uploadId: session.id },
            );
          }
          throw error;
        }
      })();
      const actualSize = head.size;
      const actualMimeType = normalizeMimeType(head.contentType);
      const actualEtag = head.etag ? normalizeEtag(head.etag) : null;

      if (actualSize === null) {
        throw new ApiError(
          500,
          "UPLOAD_INVALID_STATE",
          "업로드된 파일 크기를 확인할 수 없습니다.",
        );
      }

      // 1% 오차 허용 (메타데이터 크기는 약간의 차이가 발생할 수 있음)
      const sizeTolerance = session.fileSize * 0.01;
      const sizeDiff = Math.abs(actualSize - session.fileSize);
      if (sizeDiff > sizeTolerance) {
        await unwrap(
          materialRepository.updateUploadSession(session.id, {
            status: "FAILED",
            errorMessage: "업로드된 파일 크기가 올바르지 않습니다.",
          }),
        );
        throw new ApiError(
          400,
          "UPLOAD_SIZE_MISMATCH",
          "업로드된 파일 크기가 올바르지 않습니다.",
          { expected: session.fileSize, actual: actualSize, tolerance: "1%" },
        );
      }

      if (actualMimeType !== expectedMimeType) {
        await unwrap(
          materialRepository.updateUploadSession(session.id, {
            status: "FAILED",
            errorMessage: "업로드된 파일 형식이 올바르지 않습니다.",
          }),
        );
        throw new ApiError(
          400,
          "UPLOAD_CONTENT_TYPE_MISMATCH",
          "업로드된 파일 형식이 올바르지 않습니다.",
          { expected: expectedMimeType, actual: actualMimeType },
        );
      }

      if (validated.etag && actualEtag) {
        const expectedEtag = normalizeEtag(validated.etag);
        if (expectedEtag !== actualEtag) {
          await unwrap(
            materialRepository.updateUploadSession(session.id, {
              status: "FAILED",
              errorMessage: "업로드된 파일 무결성 검증에 실패했습니다.",
            }),
          );
          throw new ApiError(
            400,
            "UPLOAD_ETAG_MISMATCH",
            "업로드된 파일 무결성 검증에 실패했습니다.",
            { expected: expectedEtag, actual: actualEtag },
          );
        }
      }

      tempBytes = await (async () => {
        try {
          return await getObjectBytes({ key: session.objectKey });
        } catch (error) {
          if (getHttpStatusCode(error) === 404) {
            throw new ApiError(
              400,
              "UPLOAD_OBJECT_NOT_FOUND",
              "업로드된 파일을 찾을 수 없습니다.",
              { uploadId: session.id },
            );
          }
          throw error;
        }
      })();
      if (tempBytes.length !== session.fileSize) {
        await unwrap(
          materialRepository.updateUploadSession(session.id, {
            status: "FAILED",
            errorMessage: "업로드된 파일 크기가 올바르지 않습니다.",
          }),
        );
        throw new ApiError(
          400,
          "UPLOAD_SIZE_MISMATCH",
          "업로드된 파일 크기가 올바르지 않습니다.",
          { expected: session.fileSize, actual: tempBytes.length },
        );
      }

      const checksum = createHash("sha256").update(tempBytes).digest("hex");
      const duplicate = await unwrap(
        materialRepository.findDuplicateByChecksum(userId, checksum),
      );

      if (duplicate) {
        await unwrap(
          materialRepository.updateUploadSession(session.id, {
            status: "FAILED",
            errorMessage: "동일한 파일이 이미 존재합니다.",
          }),
        );
        await deleteObject({ key: session.objectKey });
        throw new ApiError(
          409,
          "MATERIAL_DUPLICATE",
          "동일한 파일이 이미 존재합니다.",
          { materialId: duplicate.id },
        );
      }

      const sourceType = inferMaterialSourceTypeFromFile({
        mimeType: session.mimeType,
        originalFilename: session.originalFilename,
      });
      if (!sourceType) {
        throw new ApiError(
          500,
          "UPLOAD_INVALID_STATE",
          "업로드 정보가 올바르지 않습니다.",
        );
      }

      materialId = crypto.randomUUID();
      const finalKey = buildFinalObjectKey({
        userId,
        materialId,
        originalFilename: session.originalFilename,
        now,
      });
      finalObjectKey = finalKey;

      await copyObject({
        sourceKey: session.objectKey,
        destinationKey: finalKey,
        contentType: session.mimeType,
      });
      await deleteObject({ key: session.objectKey });

      const title = inferTitle({
        title: validated.title,
        titleHint: null,
        originalFilename: session.originalFilename,
      });

      const ingestResult = await ingestMaterial({
        userId,
        materialId,
        materialTitle: title,
        originalFilename: session.originalFilename ?? null,
        mimeType: session.mimeType,
        bytes: tempBytes,
      });

      const summary = ingestResult.fullText.slice(0, 240).trim() || null;

      const createdAt = new Date();
      await unwrap(
        materialRepository.insertMaterial({
          id: materialId,
          userId,
          sourceType,
          title,
          originalFilename: session.originalFilename,
          rawText: ingestResult.fullText,
          storageProvider: "R2",
          storageKey: finalKey,
          mimeType: session.mimeType,
          fileSize: session.fileSize,
          checksum,
          processingStatus: "READY",
          processedAt: createdAt,
          summary,
          createdAt,
          updatedAt: createdAt,
        }),
      );

      await unwrap(
        materialRepository.updateUploadSession(session.id, {
          status: "COMPLETED",
          completedAt: new Date(),
          etag: head.etag,
          finalObjectKey: finalKey,
          materialId,
        }),
      );

      return CreateMaterialResult.parse({
        mode: "sync",
        materialId,
        title,
        processingStatus: "READY",
        summary,
      });
    } catch (error) {
      await unwrap(
        materialRepository.updateUploadSession(session.id, {
          status: "FAILED",
          completedAt: new Date(),
          errorMessage:
            error instanceof Error
              ? error.message
              : "업로드 완료 처리에 실패했습니다.",
        }),
      );

      // best-effort cleanup (temp object)
      try {
        await deleteObject({ key: session.objectKey });
      } catch {
        // ignore cleanup error
      }

      // best-effort cleanup (final object)
      try {
        if (finalObjectKey) {
          await deleteObject({ key: finalObjectKey });
        }
      } catch {
        // ignore cleanup error
      }

      // best-effort cleanup (vector index)
      try {
        if (materialId) {
          const { getVectorStoreForUser } = await import(
            "../../../ai/rag/vector-store"
          );
          const store = await getVectorStoreForUser({ userId });
          await store.delete({
            filter: { userId, materialId },
          });
        }
      } catch {
        // ignore cleanup error
      }

      throw error;
    } finally {
      tempBytes = null;
      finalObjectKey = null;
      materialId = null;
    }
  });
}
