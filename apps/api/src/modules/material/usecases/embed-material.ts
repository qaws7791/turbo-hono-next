import { chunkParsedSegments } from "../../../ai/ingestion/chunk";
import { embedTexts } from "../../../ai/ingestion/embed";
import { CONFIG } from "../../../lib/config";
import { logger } from "../../../lib/logger";
import { requireOpenAi } from "../../../lib/openai";
import { throwAppError } from "../../../lib/result";
import { ApiError } from "../../../middleware/error-handler";
import { materialRepository } from "../material.repository";

import type { Result, ResultAsync } from "neverthrow";
import type { ParseResult } from "../../../ai/ingestion/parse";
import type { AppError } from "../../../lib/result";
import type { MaterialProcessingStatus } from "../material.dto";

export type EmbedJobPayload = {
  readonly jobId: string;
  readonly materialId: string;
};

type ChunkRow = {
  id: string;
  materialId: string;
  ordinal: number;
  content: string;
  tokenCount: number;
  pageStart: number | null;
  pageEnd: number | null;
  sectionPath: string | null;
  createdAt: Date;
};

let embedJobChain: Promise<void> = Promise.resolve();

async function unwrap<T>(
  result: ResultAsync<T, AppError> | Promise<Result<T, AppError>>,
): Promise<T> {
  const awaited = await result;
  if (awaited.isErr()) {
    throwAppError(awaited.error);
  }
  return awaited.value;
}

/**
 * 임베딩 작업을 큐에 추가합니다.
 * 작업들은 순차적으로 실행됩니다.
 */
export function enqueueEmbedJob(payload: EmbedJobPayload): void {
  embedJobChain = embedJobChain
    .then(async () => {
      await runEmbedJob(payload);
    })
    .catch((error: unknown) => {
      logger.error(
        { err: error, jobId: payload.jobId },
        "material.embed.job.failed",
      );
    });
}

/**
 * 비동기 임베딩 작업을 실행합니다.
 */
async function runEmbedJob(payload: EmbedJobPayload): Promise<void> {
  const now = new Date();

  const job = await unwrap(
    materialRepository.getMaterialJobById(payload.jobId),
  );
  if (!job || job.status === "SUCCEEDED") return;

  await unwrap(
    materialRepository.updateMaterialJob(payload.jobId, {
      status: "RUNNING",
      startedAt: now,
      progress: "0",
      jobType: "EMBED",
    }),
  );

  try {
    requireOpenAi();
    const chunks = await unwrap(
      materialRepository.getChunksForEmbedding(payload.materialId),
    );

    const chunkIds = chunks.map((chunk) => chunk.id);
    if (chunkIds.length === 0) {
      throw new ApiError(
        500,
        "MATERIAL_EMBED_FAILED",
        "임베딩 대상 청크가 없습니다.",
      );
    }

    await unwrap(
      materialRepository.deleteExistingEmbeddings(
        chunkIds,
        CONFIG.OPENAI_EMBEDDING_MODEL,
      ),
    );

    const batchSize = 64;
    for (let index = 0; index < chunks.length; index += batchSize) {
      const batch = chunks.slice(index, index + batchSize);
      const { vectors, model } = await embedTexts(batch.map((c) => c.content));

      if (vectors.length !== batch.length) {
        throw new ApiError(
          500,
          "MATERIAL_EMBED_FAILED",
          "임베딩 결과가 올바르지 않습니다.",
        );
      }

      const rows = batch.map((chunk, i) => {
        const vector = vectors[i];
        if (!vector || vector.length === 0) {
          throw new ApiError(
            500,
            "MATERIAL_EMBED_FAILED",
            "임베딩 벡터가 비어있습니다.",
          );
        }

        return {
          id: crypto.randomUUID(),
          chunkId: chunk.id,
          model,
          vector,
          createdAt: new Date(),
        };
      });

      await unwrap(materialRepository.insertMaterialEmbeddings(rows));

      const progress = Math.min(1, (index + batch.length) / chunks.length);
      await unwrap(
        materialRepository.updateMaterialJob(payload.jobId, {
          progress: String(progress),
        }),
      );
    }

    const finishedAt = new Date();
    await unwrap(
      materialRepository.updateMaterialStatus(
        payload.materialId,
        "READY",
        finishedAt,
        null,
      ),
    );

    await unwrap(
      materialRepository.updateMaterialJob(payload.jobId, {
        status: "SUCCEEDED",
        progress: "1",
        finishedAt,
      }),
    );
  } catch (error) {
    const finishedAt = new Date();
    const message =
      error instanceof Error
        ? error.message
        : "임베딩 처리 중 오류가 발생했습니다.";

    await unwrap(
      materialRepository.updateMaterialStatus(
        payload.materialId,
        "FAILED",
        null,
        message,
      ),
    );

    await unwrap(
      materialRepository.updateMaterialJob(payload.jobId, {
        status: "FAILED",
        finishedAt,
        errorJson: { code: "MATERIAL_EMBED_FAILED", message },
      }),
    );

    throw error;
  }
}

/**
 * 동기적으로 임베딩을 수행합니다.
 * 청크 수가 적을 때 사용됩니다.
 */
export async function embedMaterialSync(
  chunkRows: ReadonlyArray<ChunkRow>,
): Promise<void> {
  const { vectors, model } = await embedTexts(
    chunkRows.map((chunk) => chunk.content),
  );

  if (vectors.length !== chunkRows.length) {
    throw new ApiError(
      500,
      "MATERIAL_EMBED_FAILED",
      "임베딩 결과가 올바르지 않습니다.",
    );
  }

  const embeddingRows = chunkRows.map((chunk, index) => {
    const vector = vectors[index];
    if (!vector || vector.length === 0) {
      throw new ApiError(
        500,
        "MATERIAL_EMBED_FAILED",
        "임베딩 벡터가 비어있습니다.",
      );
    }

    return {
      id: crypto.randomUUID(),
      chunkId: chunk.id,
      model,
      vector,
      createdAt: new Date(),
    };
  });

  await unwrap(materialRepository.insertMaterialEmbeddings(embeddingRows));
}

/**
 * ParseResult로부터 청크 행을 생성합니다.
 */
export function buildChunkRows(
  materialId: string,
  parsed: ParseResult,
): Array<ChunkRow> {
  const baseChunks = chunkParsedSegments(parsed.segments);
  return baseChunks.map((chunk) => ({
    id: crypto.randomUUID(),
    materialId,
    ordinal: chunk.ordinal,
    content: chunk.content,
    tokenCount: chunk.tokenCount,
    pageStart: chunk.pageStart ?? null,
    pageEnd: chunk.pageEnd ?? null,
    sectionPath: chunk.sectionPath ?? null,
    createdAt: new Date(),
  }));
}

/**
 * 임베딩 처리 결과를 반환합니다.
 */
export type EmbedResult =
  | {
      mode: "sync";
      processingStatus: MaterialProcessingStatus;
    }
  | {
      mode: "async";
      jobId: string;
      processingStatus: MaterialProcessingStatus;
    }
  | {
      mode: "skipped";
      processingStatus: MaterialProcessingStatus;
    };

/**
 * Material에 대한 임베딩 처리를 수행합니다.
 * OpenAI API 키가 없으면 건너뛰고, 청크 수에 따라 동기/비동기로 처리합니다.
 */
export async function processEmbedding(
  materialId: string,
  chunkRows: Array<ChunkRow>,
): Promise<EmbedResult> {
  const shouldAsyncEmbed = chunkRows.length > 40;

  // OpenAI API 키가 없으면 임베딩 건너뛰기
  if (!CONFIG.OPENAI_API_KEY) {
    await unwrap(
      materialRepository.updateMaterialStatus(
        materialId,
        "READY",
        new Date(),
        null,
      ),
    );
    return { mode: "skipped", processingStatus: "READY" };
  }

  // 청크 수가 적으면 동기 처리
  if (!shouldAsyncEmbed) {
    try {
      await embedMaterialSync(chunkRows);
      await unwrap(
        materialRepository.updateMaterialStatus(
          materialId,
          "READY",
          new Date(),
          null,
        ),
      );
      return { mode: "sync", processingStatus: "READY" };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "임베딩 처리 중 오류가 발생했습니다.";

      await unwrap(
        materialRepository.updateMaterialStatus(
          materialId,
          "FAILED",
          null,
          message,
        ),
      );
      throw error;
    }
  }

  // 청크 수가 많으면 비동기 처리
  const job = await unwrap(
    materialRepository.insertMaterialJob({
      id: crypto.randomUUID(),
      materialId,
      jobType: "EMBED",
      status: "QUEUED",
      progress: "0",
      createdAt: new Date(),
    }),
  );

  enqueueEmbedJob({ jobId: job.id, materialId });

  return {
    mode: "async",
    jobId: job.id,
    processingStatus: "PROCESSING",
  };
}
