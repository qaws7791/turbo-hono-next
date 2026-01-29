/**
 * Material 처리 프로세서
 *
 * Worker에서 호출되는 실제 Material 처리 로직입니다.
 * 기존 completeMaterialUpload의 핵심 로직을 재사용합니다.
 */
import { createHash } from "node:crypto";

import { ResultAsync } from "neverthrow";

import { coreError, isCoreError } from "../../../../common/core-error";
import { toAppError } from "../../../../common/result";

import { analyzeMaterialForOutline } from "./build-material-outline";

import type {
  MaterialProcessingJobData,
  MaterialProcessingJobResult,
  MaterialProcessingProgress,
} from "../../api/queue.types";
import type { AppError } from "../../../../common/result";
import type {
  DocumentParserPort,
  KnowledgeFacadeForMaterialPort,
  MaterialAnalyzerPort,
  R2StoragePort,
} from "../../api/ports";
import type { MaterialRepository } from "../infrastructure/material.repository";

export type ProcessMaterialDeps = {
  readonly materialRepository: MaterialRepository;
  readonly documentParser: DocumentParserPort;
  readonly r2: R2StoragePort;
  readonly knowledge: KnowledgeFacadeForMaterialPort;
  readonly materialAnalyzer: MaterialAnalyzerPort;
};

type ProgressCallback = (
  step: MaterialProcessingProgress["step"],
  progress: number,
  message?: string,
) => Promise<void>;

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

/**
 * Material 처리 프로세서 생성
 */
export function createMaterialProcessor(deps: ProcessMaterialDeps) {
  return function processMaterial(
    jobData: MaterialProcessingJobData,
    updateProgress: ProgressCallback,
  ): ResultAsync<MaterialProcessingJobResult, AppError> {
    const { userId, uploadId, title } = jobData;

    return ResultAsync.fromPromise(
      (async () => {
        let sessionId: string | null = null;
        let materialId: string | null = null;

        try {
          // 1. 세션 및 Material 조회
          await updateProgress("VALIDATING", 5, "데이터 확인 중...");

          const sessionResult =
            await deps.materialRepository.findUploadSessionByIdForUser(
              uploadId,
              userId,
            );
          if (sessionResult.isErr()) throw sessionResult.error;

          const session = sessionResult.value;
          if (!session) {
            throw coreError({
              code: "UPLOAD_NOT_FOUND",
              message: "업로드 세션을 찾을 수 없습니다.",
              details: { uploadId },
            });
          }

          sessionId = session.id;
          materialId = session.materialId;
          if (!materialId) {
            throw coreError({
              code: "MATERIAL_NOT_FOUND",
              message: "Material이 생성되지 않았습니다.",
              details: { uploadId },
            });
          }

          // 2. Material 상태를 PROCESSING으로 업데이트
          const statusResult =
            await deps.materialRepository.updateMaterialStatus(
              materialId,
              "PROCESSING",
              null,
              null,
            );
          if (statusResult.isErr()) throw statusResult.error;

          await updateProgress("PARSING", 10, "파일 다운로드 중...");

          // 3. 파일 다운로드
          const bytesResult = await deps.r2.getObjectBytes({
            key: session.objectKey,
          });
          if (bytesResult.isErr()) throw bytesResult.error;

          const tempBytes = bytesResult.value;
          const now = new Date();

          // 4. 체크섬 계산 및 중복 체크
          await updateProgress("PARSING", 20, "중복 확인 중...");

          const checksum = createHash("sha256").update(tempBytes).digest("hex");

          const checksumResult = await deps.materialRepository.updateChecksum(
            materialId,
            checksum,
            now,
          );
          if (checksumResult.isErr()) throw checksumResult.error;

          // 5. 파일 이동 (임시 → 영구)
          await updateProgress("PARSING", 30, "파일 저장 중...");

          const finalKey = buildFinalObjectKey({
            userId,
            materialId,
            originalFilename: session.originalFilename,
            now,
          });

          const copyResult = await deps.r2.copyObject({
            sourceKey: session.objectKey,
            destinationKey: finalKey,
            contentType: session.mimeType,
          });
          if (copyResult.isErr()) throw copyResult.error;

          const storageKeyResult =
            await deps.materialRepository.updateStorageKey(
              materialId,
              finalKey,
              now,
            );
          if (storageKeyResult.isErr()) throw storageKeyResult.error;

          const deleteTempResult = await deps.r2.deleteObject({
            key: session.objectKey,
          });
          if (deleteTempResult.isErr()) throw deleteTempResult.error;

          // 6. 문서 파싱
          await updateProgress("PARSING", 40, "문서 분석 중...");

          const parsed = await deps.documentParser.parseFileBytesSource({
            bytes: tempBytes,
            mimeType: session.mimeType,
            originalFilename: session.originalFilename,
            fileSize: tempBytes.length,
          });

          // 7. AI 분석
          await updateProgress(
            "ANALYZING",
            55,
            "AI가 내용을 분석하고 있습니다...",
          );

          const analyzedResult = await analyzeMaterialForOutline(
            { materialAnalyzer: deps.materialAnalyzer },
            {
              materialId,
              fullText: parsed.fullText,
              mimeType: session.mimeType,
            },
          );
          if (analyzedResult.isErr()) throw analyzedResult.error;

          const analyzed = analyzedResult.value;
          const summary = analyzed.summary;
          const finalTitle = analyzed.title || title;

          // 8. RAG 인덱싱
          await updateProgress("INDEXING", 75, "검색 인덱스 생성 중...");

          const ingestResult = await deps.knowledge.ingest({
            userId,
            type: "material",
            refId: materialId,
            title: finalTitle,
            originalFilename: session.originalFilename ?? null,
            mimeType: session.mimeType,
            bytes: tempBytes,
          });
          if (ingestResult.isErr()) throw ingestResult.error;

          // 9. DB 업데이트
          await updateProgress("FINALIZING", 90, "저장 중...");

          const cleanTitle = finalTitle.replace(/\0/g, "");
          const cleanSummary = summary?.replace(/\0/g, "") ?? null;

          const titleResult = await deps.materialRepository.updateTitle(
            userId,
            materialId,
            cleanTitle,
            now,
          );
          if (titleResult.isErr()) throw titleResult.error;

          const summaryResult =
            await deps.materialRepository.updateMaterialSummary(
              materialId,
              cleanSummary,
              now,
            );
          if (summaryResult.isErr()) throw summaryResult.error;

          const outlineResult =
            await deps.materialRepository.replaceOutlineNodes(
              materialId,
              analyzed.outlineRows,
            );
          if (outlineResult.isErr()) throw outlineResult.error;

          const readyResult =
            await deps.materialRepository.updateMaterialStatus(
              materialId,
              "READY",
              now,
              null,
            );
          if (readyResult.isErr()) throw readyResult.error;

          const doneResult = await deps.materialRepository.updateUploadSession(
            session.id,
            {
              status: "COMPLETED",
              completedAt: now,
              finalObjectKey: finalKey,
            },
          );
          if (doneResult.isErr()) throw doneResult.error;

          await updateProgress("COMPLETED", 100, "완료!");

          return {
            materialId,
            title: cleanTitle,
            summary: cleanSummary,
            processingStatus: "READY" as const,
          };
        } catch (cause) {
          const message = isCoreError(cause)
            ? cause.message
            : cause instanceof Error
              ? cause.message
              : "알 수 없는 오류가 발생했습니다.";

          if (materialId) {
            const failResult =
              await deps.materialRepository.updateMaterialStatus(
                materialId,
                "FAILED",
                null,
                message,
              );
            if (failResult.isErr()) {
              // ignore
            }
          }

          if (sessionId) {
            const failSessionResult =
              await deps.materialRepository.updateUploadSession(sessionId, {
                status: "FAILED",
                errorMessage: message,
              });
            if (failSessionResult.isErr()) {
              // ignore
            }
          }

          throw cause;
        }
      })(),
      (error) => toAppError(error),
    );
  };
}
