import { coreError } from "../../../../common/core-error";
import { tryPromise } from "../../../../common/result";

import type {
  KnowledgeDocumentMetadata,
  KnowledgeSearchResult,
} from "../../api";
import type { KnowledgeVectorStoreManager } from "../infrastructure/knowledge-vector-store.manager";
import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";

export class KnowledgeRetriever {
  private readonly vectorStoreManager: KnowledgeVectorStoreManager;

  constructor(deps: {
    readonly vectorStoreManager: KnowledgeVectorStoreManager;
  }) {
    this.vectorStoreManager = deps.vectorStoreManager;
  }

  retrieve(params: {
    readonly userId: string;
    readonly query: string;
    readonly filter?: {
      readonly type?: string;
      readonly refIds?: ReadonlyArray<string>;
    };
    readonly limit?: number;
  }): ResultAsync<ReadonlyArray<KnowledgeSearchResult>, AppError> {
    const topK = params.limit ?? 5;
    return tryPromise(async () => {
      const store = await this.vectorStoreManager.getStoreForUser({
        userId: params.userId,
      });

      const filter: Record<string, unknown> = { userId: params.userId };
      if (params.filter?.type) filter.type = params.filter.type;
      if (params.filter?.refIds && params.filter.refIds.length > 0) {
        filter.refId = { in: [...params.filter.refIds] };
      }

      const results = await store.similaritySearchWithScore(
        params.query,
        topK,
        filter as never,
      );

      return results
        .map(([doc, distance]) => {
          const documentId = doc.id;
          if (!documentId) {
            throw coreError({
              code: "KNOWLEDGE_RETRIEVE_FAILED",
              message: "검색 결과의 문서 ID가 없습니다.",
            });
          }
          return {
            documentId,
            content: doc.pageContent,
            metadata: this.parseMetadata(doc.metadata),
            distance: this.parseDistance(distance),
          };
        })
        .filter((row) => row.content.trim().length > 0);
    });
  }

  retrieveRange(params: {
    readonly userId: string;
    readonly type: string;
    readonly refId: string;
    readonly startIndex: number;
    readonly endIndex: number;
  }): ResultAsync<ReadonlyArray<KnowledgeSearchResult>, AppError> {
    return tryPromise(async () => {
      const store = await this.vectorStoreManager.getStoreForUser({
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
          AND ${store.metadataColumnName}->>'type' = $3
          AND ${store.metadataColumnName}->>'refId' = $4
          AND (${store.metadataColumnName}->>'chunkIndex')::int >= $5
          AND (${store.metadataColumnName}->>'chunkIndex')::int <= $6
        ORDER BY (${store.metadataColumnName}->>'chunkIndex')::int ASC
      `;

      const result = await store.pool.query(query, [
        collectionId,
        params.userId,
        params.type,
        params.refId,
        params.startIndex,
        params.endIndex,
      ]);

      return result.rows
        .map((row) => {
          const documentId = row.id;
          if (!documentId) {
            throw coreError({
              code: "KNOWLEDGE_RETRIEVE_FAILED",
              message: "검색 결과의 문서 ID가 없습니다.",
            });
          }
          return {
            documentId: String(documentId),
            content: String(row.content ?? ""),
            metadata: this.parseMetadata(row.metadata),
            distance: 0,
          };
        })
        .filter((row) => row.content.trim().length > 0);
    });
  }

  getChunkStats(params: {
    readonly userId: string;
    readonly type: string;
    readonly refIds: ReadonlyArray<string>;
  }): ResultAsync<Map<string, { chunkCount: number }>, AppError> {
    return tryPromise(async () => {
      if (params.refIds.length === 0) {
        return new Map<string, { chunkCount: number }>();
      }

      const store = await this.vectorStoreManager.getStoreForUser({
        userId: params.userId,
      });
      const collectionId = await store.getOrCreateCollection();

      const placeholders = params.refIds
        .map((_, idx) => `$${idx + 4}`)
        .join(", ");

      const query = `
        SELECT 
          ${store.metadataColumnName}->>'refId' as ref_id,
          count(*) as chunk_count
        FROM ${store.computedTableName}
        WHERE collection_id = $1
          AND ${store.metadataColumnName}->>'userId' = $2
          AND ${store.metadataColumnName}->>'type' = $3
          AND ${store.metadataColumnName}->>'refId' IN (${placeholders})
        GROUP BY ${store.metadataColumnName}->>'refId'
      `;

      const result = await store.pool.query(query, [
        collectionId,
        params.userId,
        params.type,
        ...params.refIds,
      ]);

      const statsMap = new Map<string, { chunkCount: number }>();
      for (const row of result.rows) {
        const refId = String(row.ref_id);
        statsMap.set(refId, { chunkCount: this.parseCount(row.chunk_count) });
      }

      for (const refId of params.refIds) {
        if (!statsMap.has(refId)) {
          statsMap.set(refId, { chunkCount: 0 });
        }
      }

      return statsMap;
    });
  }

  countChunks(params: {
    readonly userId: string;
    readonly type: string;
    readonly refId: string;
  }): ResultAsync<number, AppError> {
    return tryPromise(async () => {
      const store = await this.vectorStoreManager.getStoreForUser({
        userId: params.userId,
      });
      const collectionId = await store.getOrCreateCollection();

      const query = `
        SELECT count(*) as count
        FROM ${store.computedTableName}
        WHERE collection_id = $1
          AND ${store.metadataColumnName}->>'userId' = $2
          AND ${store.metadataColumnName}->>'type' = $3
          AND ${store.metadataColumnName}->>'refId' = $4
      `;

      const result = await store.pool.query(query, [
        collectionId,
        params.userId,
        params.type,
        params.refId,
      ]);

      const row = result.rows[0];
      if (!row) {
        throw coreError({
          code: "KNOWLEDGE_INDEX_FAILED",
          message: "인덱스 상태를 확인할 수 없습니다.",
        });
      }

      return this.parseCount(row.count);
    });
  }

  private parseMetadata(value: unknown): KnowledgeDocumentMetadata {
    if (!this.isRecord(value)) {
      throw coreError({
        code: "KNOWLEDGE_METADATA_INVALID",
        message: "인덱스 메타데이터가 올바르지 않습니다.",
      });
    }

    return {
      userId: this.parseStringField(value, "userId"),
      type: this.parseStringField(value, "type"),
      refId: this.parseStringField(value, "refId"),
      title: this.parseStringField(value, "title"),
      originalFilename: this.parseNullableStringField(
        value,
        "originalFilename",
      ),
      mimeType: this.parseNullableStringField(value, "mimeType"),
      pageNumber: this.parseOptionalNumberField(value, "pageNumber"),
      chunkIndex: this.parseNumberField(value, "chunkIndex"),
    };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  private parseStringField(
    metadata: Record<string, unknown>,
    key: keyof KnowledgeDocumentMetadata,
  ): string {
    const value = metadata[String(key)];
    if (typeof value !== "string" || value.trim().length === 0) {
      throw coreError({
        code: "KNOWLEDGE_METADATA_INVALID",
        message: "인덱스 메타데이터가 올바르지 않습니다.",
        details: { key: String(key), value },
      });
    }
    return value;
  }

  private parseNullableStringField(
    metadata: Record<string, unknown>,
    key: keyof KnowledgeDocumentMetadata,
  ): string | null {
    const value = metadata[String(key)];
    if (value === null) return null;
    if (typeof value === "string") return value;
    if (typeof value === "undefined") return null;
    throw coreError({
      code: "KNOWLEDGE_METADATA_INVALID",
      message: "인덱스 메타데이터가 올바르지 않습니다.",
      details: { key: String(key), value },
    });
  }

  private parseOptionalNumberField(
    metadata: Record<string, unknown>,
    key: keyof KnowledgeDocumentMetadata,
  ): number | undefined {
    const value = metadata[String(key)];
    if (typeof value === "number") return value;
    return undefined;
  }

  private parseNumberField(
    metadata: Record<string, unknown>,
    key: keyof KnowledgeDocumentMetadata,
  ): number {
    const value = metadata[String(key)];
    if (typeof value === "number") return value;
    throw coreError({
      code: "KNOWLEDGE_METADATA_INVALID",
      message: "인덱스 메타데이터가 올바르지 않습니다.",
      details: { key: String(key), value },
    });
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
