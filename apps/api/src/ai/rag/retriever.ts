import { tryPromise } from "../../lib/result";
import { ApiError } from "../../middleware/error-handler";

import { ragVectorStoreManager } from "./vector-store";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../lib/result";
import type { RagDocumentMetadata, RagSearchResult } from "./types";

export type MaterialChunkStats = {
  readonly materialId: string;
  readonly chunkCount: number;
  readonly estimatedMinutes: number;
};

export class RagRetriever {
  /**
   * 유사도 기반 검색
   */
  public async search(params: {
    readonly userId: string;
    readonly materialIds: ReadonlyArray<string>;
    readonly query: string;
    readonly topK: number;
  }): Promise<ReadonlyArray<RagSearchResult>> {
    const store = await ragVectorStoreManager.getStoreForUser({
      userId: params.userId,
    });

    const filterBase = {
      userId: params.userId,
    } as const;

    const filter =
      params.materialIds.length > 0
        ? { ...filterBase, materialId: { in: [...params.materialIds] } }
        : filterBase;

    const results = await store.similaritySearchWithScore(
      params.query,
      params.topK,
      filter,
    );

    return results
      .map(([doc, distance]) => {
        const documentId = doc.id;
        if (!documentId) {
          throw new ApiError(
            500,
            "RAG_RETRIEVE_FAILED",
            "검색 결과의 문서 ID가 없습니다.",
          );
        }
        return {
          documentId,
          content: doc.pageContent,
          metadata: this.parseRagMetadata(doc.metadata),
          distance: this.parseDistance(distance),
        };
      })
      .filter((row) => row.content.trim().length > 0);
  }

  /**
   * 특정 청크 범위의 내용을 검색 (chunkIndex 기준)
   */
  public async retrieveRange(params: {
    readonly userId: string;
    readonly materialId: string;
    readonly startIndex: number;
    readonly endIndex: number;
  }): Promise<ReadonlyArray<RagSearchResult>> {
    const store = await ragVectorStoreManager.getStoreForUser({
      userId: params.userId,
    });
    const collectionId = await store.getOrCreateCollection();

    const query = `
      SELECT 
        id,
        content,
        ${store.metadataColumnName} as metadata
      FROM ${store.computedTableName}
      WHERE collection_id = $1
        AND ${store.metadataColumnName}->>'userId' = $2
        AND ${store.metadataColumnName}->>'materialId' = $3
        AND (${store.metadataColumnName}->>'chunkIndex')::int >= $4
        AND (${store.metadataColumnName}->>'chunkIndex')::int <= $5
      ORDER BY (${store.metadataColumnName}->>'chunkIndex')::int ASC
    `;

    const result = await store.pool.query(query, [
      collectionId,
      params.userId,
      params.materialId,
      params.startIndex,
      params.endIndex,
    ]);

    return result.rows
      .map((row) => {
        const documentId = row.id;
        if (!documentId) {
          throw new ApiError(
            500,
            "RAG_RETRIEVE_FAILED",
            "검색 결과의 문서 ID가 없습니다.",
          );
        }
        return {
          documentId: String(documentId),
          content: String(row.content ?? ""),
          metadata: this.parseRagMetadata(row.metadata),
          distance: 0,
        };
      })
      .filter((row) => row.content.trim().length > 0);
  }

  /**
   * 여러 자료의 청크 통계를 한 번에 조회
   */
  public getMaterialsChunkStats(params: {
    readonly userId: string;
    readonly materialIds: ReadonlyArray<string>;
  }): ResultAsync<Map<string, MaterialChunkStats>, AppError> {
    return tryPromise(async () => {
      if (params.materialIds.length === 0) {
        return new Map<string, MaterialChunkStats>();
      }

      const store = await ragVectorStoreManager.getStoreForUser({
        userId: params.userId,
      });
      const collectionId = await store.getOrCreateCollection();

      const placeholders = params.materialIds
        .map((_, idx) => `$${idx + 3}`)
        .join(", ");

      const query = `
        SELECT 
          ${store.metadataColumnName}->>'materialId' as material_id,
          count(*) as chunk_count
        FROM ${store.computedTableName}
        WHERE collection_id = $1
          AND ${store.metadataColumnName}->>'userId' = $2
          AND ${store.metadataColumnName}->>'materialId' IN (${placeholders})
        GROUP BY ${store.metadataColumnName}->>'materialId'
      `;

      const result = await store.pool.query(query, [
        collectionId,
        params.userId,
        ...params.materialIds,
      ]);

      const statsMap = new Map<string, MaterialChunkStats>();

      for (const row of result.rows) {
        const materialId = String(row.material_id);
        const chunkCount = this.parseCount(row.chunk_count);
        statsMap.set(materialId, {
          materialId,
          chunkCount,
          estimatedMinutes: Math.ceil(chunkCount * 5),
        });
      }

      for (const materialId of params.materialIds) {
        if (!statsMap.has(materialId)) {
          statsMap.set(materialId, {
            materialId,
            chunkCount: 0,
            estimatedMinutes: 0,
          });
        }
      }

      return statsMap;
    });
  }

  /**
   * 단일 자료의 청크 수 조회
   */
  public countMaterialChunks(params: {
    readonly userId: string;
    readonly materialId: string;
  }): ResultAsync<number, AppError> {
    return tryPromise(async () => {
      const store = await ragVectorStoreManager.getStoreForUser({
        userId: params.userId,
      });
      const collectionId = await store.getOrCreateCollection();

      const query = `
        SELECT count(*) as count
        FROM ${store.computedTableName}
        WHERE collection_id = $1
          AND ${store.metadataColumnName}->>'userId' = $2
          AND ${store.metadataColumnName}->>'materialId' = $3
      `;

      const result = await store.pool.query(query, [
        collectionId,
        params.userId,
        params.materialId,
      ]);

      const row = result.rows[0];
      if (!row) {
        throw new ApiError(
          500,
          "MATERIAL_INDEX_FAILED",
          "인덱스 상태를 확인할 수 없습니다.",
        );
      }

      return this.parseCount(row.count);
    });
  }

  // --- Helpers ---

  private parseRagMetadata(value: unknown): RagDocumentMetadata {
    if (!this.isRecord(value)) {
      throw new ApiError(
        500,
        "RAG_METADATA_INVALID",
        "인덱스 메타데이터가 올바르지 않습니다.",
      );
    }

    return {
      userId: this.parseStringField(value, "userId"),
      materialId: this.parseStringField(value, "materialId"),
      materialTitle: this.parseStringField(value, "materialTitle"),
      originalFilename: this.parseNullableStringField(
        value,
        "originalFilename",
      ),
      mimeType: this.parseNullableStringField(value, "mimeType"),
      source: "material",
      pageNumber: this.parsePageNumber(value),
      chunkIndex: this.parseChunkIndex(value),
    };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  private parseStringField(
    metadata: Record<string, unknown>,
    key: keyof RagDocumentMetadata,
  ): string {
    const value = metadata[String(key)];
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new ApiError(
        500,
        "RAG_METADATA_INVALID",
        "인덱스 메타데이터가 올바르지 않습니다.",
        { key: String(key), value },
      );
    }
    return value;
  }

  private parseNullableStringField(
    metadata: Record<string, unknown>,
    key: keyof RagDocumentMetadata,
  ): string | null {
    const value = metadata[String(key)];
    if (value === null) return null;
    if (typeof value === "string") return value;
    if (typeof value === "undefined") return null;
    throw new ApiError(
      500,
      "RAG_METADATA_INVALID",
      "인덱스 메타데이터가 올바르지 않습니다.",
      { key: String(key), value },
    );
  }

  private parsePageNumber(
    metadata: Record<string, unknown>,
  ): number | undefined {
    const value = metadata.pageNumber;
    if (typeof value === "number") return value;
    return undefined;
  }

  private parseChunkIndex(metadata: Record<string, unknown>): number {
    const value = metadata.chunkIndex;
    if (typeof value === "number") return value;
    throw new ApiError(
      500,
      "RAG_METADATA_INVALID",
      "인덱스 메타데이터가 올바르지 않습니다.",
      { key: "chunkIndex", value },
    );
  }

  private parseDistance(value: unknown): number {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
  }

  private parseCount(value: unknown): number {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  }
}

export const ragRetriever = new RagRetriever();
