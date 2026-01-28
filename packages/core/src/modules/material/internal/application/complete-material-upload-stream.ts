import { createHash } from "node:crypto";

import { err, ok } from "neverthrow";

import { coreError, isCoreError } from "../../../../common/core-error";
import { fromPromise, toAppError } from "../../../../common/result";

import { analyzeMaterialForOutline } from "./build-material-outline";

import type { Result, ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type {
  CompleteMaterialUploadInput as CompleteMaterialUploadInputType,
  CreateMaterialResult as CreateMaterialResultType,
} from "../../api/schema";
import type {
  DocumentParserPort,
  MaterialAnalyzerPort,
  R2StoragePort,
  RagIngestorPort,
  RagVectorStoreManagerForMaterialPort,
} from "../../api/ports";
import type { MaterialRepository } from "../infrastructure/material.repository";

export type UploadProgressStep =
  | "PREPARING"
  | "VERIFYING"
  | "LOADING"
  | "CHECKING"
  | "STORING"
  | "ANALYZING"
  | "FINALIZING"
  | "COMPLETED"
  | "FAILED";

export type ProgressCallback = (
  step: UploadProgressStep,
  progress: number,
) => void | Promise<void>;

type UploadSession = {
  readonly id: string;
  readonly status: string;
  readonly expiresAt: Date;
  readonly completedAt: Date | null;
  readonly objectKey: string;
  readonly finalObjectKey: string | null;
  readonly originalFilename: string | null;
  readonly mimeType: string;
  readonly fileSize: number;
  readonly etag: string | null;
  readonly materialId: string | null;
};

type UploadState = {
  session: UploadSession | null;
  uploadStatus: "EXPIRED" | "COMPLETED" | "FAILED" | null;
  materialId: string | null;
  finalObjectKey: string | null;
};

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

function isUnknownError(
  error: AppError,
): error is Extract<
  AppError,
  { readonly _tag: "UnknownError"; readonly cause: unknown }
> {
  return (error as { _tag?: unknown })._tag === "UnknownError";
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

function toUploadFailureMessage(error: AppError): string {
  if (isCoreError(error)) return error.message;
  if (isUnknownError(error) && error.cause instanceof Error) {
    return error.cause.message;
  }
  return "업로드 완료 처리에 실패했습니다.";
}

export function completeMaterialUploadWithProgress(deps: {
  readonly materialRepository: MaterialRepository;
  readonly documentParser: DocumentParserPort;
  readonly r2: R2StoragePort;
  readonly ragIngestor: RagIngestorPort;
  readonly ragVectorStoreManager: RagVectorStoreManagerForMaterialPort;
  readonly materialAnalyzer: MaterialAnalyzerPort;
}) {
  return function completeMaterialUploadWithProgress(
    userId: string,
    input: CompleteMaterialUploadInputType,
    onProgress?: ProgressCallback,
  ): ResultAsync<CreateMaterialResultType, AppError> {
    const notify = async (step: UploadProgressStep, progress: number) => {
      if (onProgress) {
        await onProgress(step, progress);
      }
    };

    const state: UploadState = {
      session: null,
      uploadStatus: null,
      materialId: null,
      finalObjectKey: null,
    };

    const run = async (): Promise<
      Result<CreateMaterialResultType, AppError>
    > => {
      try {
        await notify("PREPARING", 5);

        const sessionResult =
          await deps.materialRepository.findUploadSessionByIdForUser(
            input.uploadId,
            userId,
          );
        if (sessionResult.isErr()) return err(sessionResult.error);

        const session = sessionResult.value;
        state.session = session;

        if (!session) {
          return err(
            coreError({
              code: "UPLOAD_NOT_FOUND",
              message: "업로드 세션을 찾을 수 없습니다.",
              details: {
                uploadId: input.uploadId,
              },
            }),
          );
        }

        if (session.status === "COMPLETED") {
          return err(
            coreError({
              code: "UPLOAD_ALREADY_COMPLETED",
              message: "이미 완료된 업로드입니다.",
              details: { uploadId: session.id, materialId: session.materialId },
            }),
          );
        }

        const now = new Date();
        if (session.expiresAt.getTime() <= now.getTime()) {
          const expiredUpdate =
            await deps.materialRepository.updateUploadSession(session.id, {
              status: "EXPIRED",
              errorMessage: "업로드 세션이 만료되었습니다.",
            });
          if (expiredUpdate.isErr()) return err(expiredUpdate.error);
          state.uploadStatus = "EXPIRED";
          return err(
            coreError({
              code: "UPLOAD_EXPIRED",
              message: "업로드 세션이 만료되었습니다.",
              details: {
                uploadId: session.id,
              },
            }),
          );
        }

        const expectedMimeType = normalizeMimeType(session.mimeType);
        if (!expectedMimeType) {
          return err(
            coreError({
              code: "UPLOAD_INVALID_STATE",
              message: "업로드 정보가 올바르지 않습니다.",
            }),
          );
        }

        await notify("VERIFYING", 15);
        const headResult = await deps.r2.headObject({ key: session.objectKey });
        if (headResult.isErr()) {
          const statusCode = isUnknownError(headResult.error)
            ? getHttpStatusCode(headResult.error.cause)
            : null;
          if (statusCode === 404) {
            return err(
              coreError({
                code: "UPLOAD_OBJECT_NOT_FOUND",
                message: "업로드된 파일을 찾을 수 없습니다.",
                details: { uploadId: session.id },
              }),
            );
          }
          return err(headResult.error);
        }

        const head = headResult.value;
        const actualSize = head.size;
        const actualMimeType = normalizeMimeType(head.contentType);
        const actualEtag = head.etag ? normalizeEtag(head.etag) : null;

        if (actualSize === null) {
          return err(
            coreError({
              code: "UPLOAD_INVALID_STATE",
              message: "업로드된 파일 크기를 확인할 수 없습니다.",
            }),
          );
        }

        const sizeTolerance = session.fileSize * 0.01;
        const sizeDiff = Math.abs(actualSize - session.fileSize);
        if (sizeDiff > sizeTolerance) {
          return err(
            coreError({
              code: "UPLOAD_SIZE_MISMATCH",
              message: "업로드된 파일 크기가 올바르지 않습니다.",
              details: {
                expected: session.fileSize,
                actual: actualSize,
                tolerance: "1%",
              },
            }),
          );
        }

        if (actualMimeType !== expectedMimeType) {
          return err(
            coreError({
              code: "UPLOAD_CONTENT_TYPE_MISMATCH",
              message: "업로드된 파일 형식이 올바르지 않습니다.",
              details: { expected: expectedMimeType, actual: actualMimeType },
            }),
          );
        }

        if (input.etag && actualEtag) {
          const expectedEtag = normalizeEtag(input.etag);
          if (expectedEtag !== actualEtag) {
            return err(
              coreError({
                code: "UPLOAD_ETAG_MISMATCH",
                message: "업로드된 파일 무결성 검증에 실패했습니다.",
                details: { expected: expectedEtag, actual: actualEtag },
              }),
            );
          }
        }

        await notify("LOADING", 30);
        const bytesResult = await deps.r2.getObjectBytes({
          key: session.objectKey,
        });
        if (bytesResult.isErr()) {
          const statusCode = isUnknownError(bytesResult.error)
            ? getHttpStatusCode(bytesResult.error.cause)
            : null;
          if (statusCode === 404) {
            return err(
              coreError({
                code: "UPLOAD_OBJECT_NOT_FOUND",
                message: "업로드된 파일을 찾을 수 없습니다.",
                details: { uploadId: session.id },
              }),
            );
          }
          return err(bytesResult.error);
        }

        const tempBytes = bytesResult.value;
        if (tempBytes.length !== session.fileSize) {
          return err(
            coreError({
              code: "UPLOAD_SIZE_MISMATCH",
              message: "업로드된 파일 크기가 올바르지 않습니다.",
              details: { expected: session.fileSize, actual: tempBytes.length },
            }),
          );
        }

        await notify("CHECKING", 40);
        const checksum = createHash("sha256").update(tempBytes).digest("hex");
        const duplicateResult =
          await deps.materialRepository.findDuplicateByChecksum(
            userId,
            checksum,
          );
        if (duplicateResult.isErr()) return err(duplicateResult.error);

        const duplicate = duplicateResult.value;
        if (duplicate) {
          return err(
            coreError({
              code: "MATERIAL_DUPLICATE",
              message: "동일한 파일이 이미 존재합니다.",
              details: {
                materialId: duplicate.id,
              },
            }),
          );
        }

        await notify("STORING", 50);
        const materialId = crypto.randomUUID();
        state.materialId = materialId;

        const finalKey = buildFinalObjectKey({
          userId,
          materialId,
          originalFilename: session.originalFilename,
          now,
        });
        state.finalObjectKey = finalKey;

        const copyResult = await deps.r2.copyObject({
          sourceKey: session.objectKey,
          destinationKey: finalKey,
          contentType: session.mimeType,
        });
        if (copyResult.isErr()) return err(copyResult.error);

        const deleteTempResult = await deps.r2.deleteObject({
          key: session.objectKey,
        });
        if (deleteTempResult.isErr()) return err(deleteTempResult.error);

        const title = inferTitle({
          title: input.title,
          titleHint: null,
          originalFilename: session.originalFilename,
        });

        await notify("ANALYZING", 60);
        const parsed = await deps.documentParser.parseFileBytesSource({
          bytes: tempBytes,
          mimeType: session.mimeType,
          originalFilename: session.originalFilename,
          fileSize: tempBytes.length,
        });

        const analyzedResult = await analyzeMaterialForOutline(
          { materialAnalyzer: deps.materialAnalyzer },
          {
            materialId,
            fullText: parsed.fullText,
            mimeType: session.mimeType,
          },
        );
        if (analyzedResult.isErr()) return err(analyzedResult.error);

        const analyzed = analyzedResult.value;
        const summary = analyzed.summary;

        const ingestResult = await deps.ragIngestor.ingest({
          userId,
          materialId,
          materialTitle: title,
          originalFilename: session.originalFilename ?? null,
          mimeType: session.mimeType,
          bytes: tempBytes,
        });
        if (ingestResult.isErr()) return err(ingestResult.error);

        await notify("ANALYZING", 90);
        await notify("FINALIZING", 95);

        const createdAt = new Date();
        const cleanTitle = title.replace(/\0/g, "");
        const cleanSummary = summary?.replace(/\0/g, "") ?? null;

        const insertResult = await deps.materialRepository.insertMaterial({
          id: materialId,
          userId,

          title: cleanTitle,
          originalFilename: session.originalFilename,
          storageProvider: "R2",
          storageKey: finalKey,
          mimeType: session.mimeType,
          fileSize: session.fileSize,
          checksum,
          processingStatus: "READY",
          processedAt: createdAt,
          summary: cleanSummary,
          createdAt,
          updatedAt: createdAt,
        });
        if (insertResult.isErr()) return err(insertResult.error);

        const outlineResult = await deps.materialRepository.replaceOutlineNodes(
          materialId,
          analyzed.outlineRows,
        );
        if (outlineResult.isErr()) return err(outlineResult.error);

        const uploadUpdateResult =
          await deps.materialRepository.updateUploadSession(session.id, {
            status: "COMPLETED",
            completedAt: new Date(),
            etag: head.etag,
            finalObjectKey: finalKey,
            materialId,
          });
        if (uploadUpdateResult.isErr()) return err(uploadUpdateResult.error);
        state.uploadStatus = "COMPLETED";

        await notify("COMPLETED", 100);

        return ok({
          mode: "sync",
          materialId,
          title,
          processingStatus: "READY",
          summary,
        });
      } catch (cause) {
        return err(toAppError(cause));
      }
    };

    const handleFailure = async (error: AppError): Promise<void> => {
      const session = state.session;
      if (!session) return;

      await notify("FAILED", 100);

      if (state.uploadStatus === null) {
        const errorMessage = toUploadFailureMessage(error);
        const updateResult = await deps.materialRepository.updateUploadSession(
          session.id,
          {
            status: "FAILED",
            completedAt: new Date(),
            errorMessage,
          },
        );
        if (updateResult.isOk()) {
          state.uploadStatus = "FAILED";
        }
      }

      const tempDelete = await deps.r2.deleteObject({ key: session.objectKey });
      if (tempDelete.isErr()) {
        // best-effort cleanup
      }

      if (state.finalObjectKey) {
        const finalDelete = await deps.r2.deleteObject({
          key: state.finalObjectKey,
        });
        if (finalDelete.isErr()) {
          // best-effort cleanup
        }
      }

      if (state.materialId) {
        try {
          const store = await deps.ragVectorStoreManager.getStoreForUser({
            userId,
          });
          await store.delete({
            filter: { userId, materialId: state.materialId },
          });
        } catch {
          // best-effort cleanup
        }

        const hardDelete = await deps.materialRepository.hardDelete(
          state.materialId,
        );
        if (hardDelete.isErr()) {
          // best-effort cleanup
        }
      }
    };

    return fromPromise(
      (async () => {
        const result = await run();
        if (result.isErr()) {
          await handleFailure(result.error);
        }
        return result;
      })(),
    ).andThen((result) => result);
  };
}
