/**
 * Material 업로드 완료 처리 (비동기 큐 버전)
 *
 * 업로드된 파일의 유효성만 검증하고, 실제 처리는 Queue에 등록합니다.
 */

import { err, ok } from "neverthrow";

import { fromPromise, toAppError } from "../../../lib/result";
import { parseOrInternalError } from "../../../lib/zod";
import { ApiError } from "../../../middleware/error-handler";
import { CreateMaterialResult } from "../material.dto";

import type { Queue } from "bullmq";
import type { Result, ResultAsync } from "neverthrow";
import type {
  MaterialProcessingJobData,
  MaterialProcessingJobResult,
} from "../../../infrastructure/queue";
import type { AppError } from "../../../lib/result";
import type {
  CompleteMaterialUploadInput as CompleteMaterialUploadInputType,
  CreateMaterialResult as CreateMaterialResultType,
} from "../material.dto";
import type { R2StoragePort } from "../material.ports";
import type { MaterialRepository } from "../material.repository";

function normalizeEtag(value: string): string {
  return value.trim().replaceAll('"', "");
}

function normalizeMimeType(value: string | null): string | null {
  if (!value) return null;
  return value.split(";")[0]?.trim().toLowerCase() ?? null;
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

export type EnqueueMaterialProcessingDeps = {
  readonly materialRepository: MaterialRepository;
  readonly r2: Pick<R2StoragePort, "headObject">;
  readonly materialProcessingQueue: Queue<
    MaterialProcessingJobData,
    MaterialProcessingJobResult
  >;
};

/**
 * Material 업로드 완료 처리 (비동기 큐 등록)
 *
 * 1. 업로드 세션 유효성 검증
 * 2. R2에 업로드된 파일 존재 및 무결성 확인
 * 3. PENDING 상태의 Material 레코드 생성
 * 4. Queue에 처리 작업 등록
 * 5. 즉시 202 Accepted 응답
 */
export function enqueueMaterialProcessing(deps: EnqueueMaterialProcessingDeps) {
  return function enqueueMaterialProcessing(
    userId: string,
    input: CompleteMaterialUploadInputType,
  ): ResultAsync<CreateMaterialResultType, AppError> {
    const run = async (): Promise<
      Result<CreateMaterialResultType, AppError>
    > => {
      try {
        // 1. 세션 조회
        const sessionResult =
          await deps.materialRepository.findUploadSessionByIdForUser(
            input.uploadId,
            userId,
          );
        if (sessionResult.isErr()) return err(sessionResult.error);

        const session = sessionResult.value;
        if (!session) {
          return err(
            new ApiError(
              404,
              "UPLOAD_NOT_FOUND",
              "업로드 세션을 찾을 수 없습니다.",
            ),
          );
        }

        if (session.status === "COMPLETED") {
          return err(
            new ApiError(
              409,
              "UPLOAD_ALREADY_COMPLETED",
              "이미 완료된 업로드입니다.",
            ),
          );
        }

        const now = new Date();
        if (session.expiresAt.getTime() <= now.getTime()) {
          await deps.materialRepository.updateUploadSession(session.id, {
            status: "EXPIRED",
            errorMessage: "업로드 세션이 만료되었습니다.",
          });
          return err(
            new ApiError(
              410,
              "UPLOAD_EXPIRED",
              "업로드 세션이 만료되었습니다.",
            ),
          );
        }

        // 2. R2 파일 존재 확인
        const expectedMimeType = normalizeMimeType(session.mimeType);
        if (!expectedMimeType) {
          return err(
            new ApiError(
              500,
              "UPLOAD_INVALID_STATE",
              "업로드 정보가 올바르지 않습니다.",
            ),
          );
        }

        const headResult = await deps.r2.headObject({ key: session.objectKey });
        if (headResult.isErr()) {
          const statusCode = isUnknownError(headResult.error)
            ? getHttpStatusCode(headResult.error.cause)
            : null;
          if (statusCode === 404) {
            return err(
              new ApiError(
                400,
                "UPLOAD_OBJECT_NOT_FOUND",
                "업로드된 파일을 찾을 수 없습니다.",
              ),
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
            new ApiError(
              500,
              "UPLOAD_INVALID_STATE",
              "업로드된 파일 크기를 확인할 수 없습니다.",
            ),
          );
        }

        // 크기 검증 (1% 허용)
        const sizeTolerance = session.fileSize * 0.01;
        const sizeDiff = Math.abs(actualSize - session.fileSize);
        if (sizeDiff > sizeTolerance) {
          return err(
            new ApiError(
              400,
              "UPLOAD_SIZE_MISMATCH",
              "업로드된 파일 크기가 올바르지 않습니다.",
            ),
          );
        }

        // MIME 타입 검증
        if (actualMimeType !== expectedMimeType) {
          return err(
            new ApiError(
              400,
              "UPLOAD_CONTENT_TYPE_MISMATCH",
              "업로드된 파일 형식이 올바르지 않습니다.",
            ),
          );
        }

        // ETag 검증 (선택적)
        if (input.etag && actualEtag) {
          const expectedEtag = normalizeEtag(input.etag);
          if (expectedEtag !== actualEtag) {
            return err(
              new ApiError(
                400,
                "UPLOAD_ETAG_MISMATCH",
                "업로드된 파일 무결성 검증에 실패했습니다.",
              ),
            );
          }
        }

        // 3. PENDING 상태 Material 생성
        const materialId = crypto.randomUUID();
        const title = input.title || session.originalFilename || "새 자료";
        const createdAt = new Date();

        const insertResult = await deps.materialRepository.insertMaterial({
          id: materialId,
          userId,
          title,
          originalFilename: session.originalFilename,
          storageProvider: "R2",
          storageKey: session.objectKey, // 아직 임시 위치
          mimeType: session.mimeType,
          fileSize: session.fileSize,
          checksum: null, // Worker에서 계산
          processingStatus: "PENDING",
          processedAt: null,
          summary: null,
          createdAt,
          updatedAt: createdAt,
        });
        if (insertResult.isErr()) return err(insertResult.error);

        // 4. 업로드 세션에 materialId 연결
        const sessionUpdateResult =
          await deps.materialRepository.updateUploadSession(session.id, {
            materialId,
          });
        if (sessionUpdateResult.isErr()) return err(sessionUpdateResult.error);

        // 5. Queue에 작업 등록
        let jobId: string;
        try {
          const job = await deps.materialProcessingQueue.add(
            "process-material",
            {
              userId,
              uploadId: input.uploadId,
              title,
              etag: input.etag,
            },
            {
              jobId: materialId, // materialId를 jobId로 사용
              removeOnComplete: true, // 성공 시 데이터 삭제
              removeOnFail: { count: 5 }, // 실패 시 최근 5개만 유지
            },
          );
          jobId = job.id!;
        } catch (cause) {
          const failMaterialResult =
            await deps.materialRepository.updateMaterialStatus(
              materialId,
              "FAILED",
              null,
              "작업 큐 등록에 실패했습니다.",
            );
          if (failMaterialResult.isErr()) {
            // ignore: 원인 에러를 우선 반환
          }

          const failSessionResult =
            await deps.materialRepository.updateUploadSession(session.id, {
              status: "FAILED",
              errorMessage: "작업 큐 등록에 실패했습니다.",
            });
          if (failSessionResult.isErr()) {
            // ignore: 원인 에러를 우선 반환
          }
          return err(
            new ApiError(
              503,
              "QUEUE_UNAVAILABLE",
              "작업 큐가 사용 불가능합니다.",
              { cause },
            ),
          );
        }

        // 6. 즉시 응답 (202 Accepted)
        const responseParsed = parseOrInternalError(
          CreateMaterialResult,
          {
            mode: "async",
            materialId,
            jobId,
            processingStatus: "PENDING" as const,
          },
          "CreateMaterialResult",
        );
        if (responseParsed.isErr()) return err(responseParsed.error);

        return ok(responseParsed.value);
      } catch (cause) {
        return err(toAppError(cause));
      }
    };

    return fromPromise(run()).andThen((result) => result);
  };
}
