import { ApiError } from "../../middleware/error-handler";

import { getVectorStoreForUser } from "./vector-store";

import type { RagDocumentMetadata, RagSearchResult } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseStringField(
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

function parseNullableStringField(
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

function parsePageNumber(
  metadata: Record<string, unknown>,
): number | undefined {
  const value = metadata.pageNumber;
  if (typeof value === "number") return value;
  return undefined;
}

function parseChunkIndex(metadata: Record<string, unknown>): number {
  const value = metadata.chunkIndex;
  if (typeof value === "number") return value;
  throw new ApiError(
    500,
    "RAG_METADATA_INVALID",
    "인덱스 메타데이터가 올바르지 않습니다.",
    { key: "chunkIndex", value },
  );
}

function parseDistance(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function parseRagMetadata(value: unknown): RagDocumentMetadata {
  if (!isRecord(value)) {
    throw new ApiError(
      500,
      "RAG_METADATA_INVALID",
      "인덱스 메타데이터가 올바르지 않습니다.",
    );
  }

  return {
    userId: parseStringField(value, "userId"),
    materialId: parseStringField(value, "materialId"),
    materialTitle: parseStringField(value, "materialTitle"),
    originalFilename: parseNullableStringField(value, "originalFilename"),
    mimeType: parseNullableStringField(value, "mimeType"),
    source: "material",
    pageNumber: parsePageNumber(value),
    chunkIndex: parseChunkIndex(value),
  };
}

export async function retrieveTopChunks(params: {
  readonly userId: string;
  readonly materialIds: ReadonlyArray<string>;
  readonly query: string;
  readonly topK: number;
}): Promise<ReadonlyArray<RagSearchResult>> {
  const store = await getVectorStoreForUser({ userId: params.userId });

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
        metadata: parseRagMetadata(doc.metadata),
        distance: parseDistance(distance),
      };
    })
    .filter((row) => row.content.trim().length > 0);
}
