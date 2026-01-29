import { createKnowledgeFacade } from "../internal/facade/knowledge.facade";
import { createKnowledgeVectorStoreManager } from "../internal/infrastructure/knowledge-vector-store.manager";

import type { EmbeddingModelPort } from "@repo/ai";
import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../common/result";

export type KnowledgeDocumentMetadata = {
  readonly userId: string;
  readonly type: string;
  readonly refId: string;
  readonly title: string;
  readonly originalFilename: string | null;
  readonly mimeType: string | null;
  readonly pageNumber?: number;
  readonly chunkIndex: number;
};

export type KnowledgeSearchResult = {
  readonly documentId: string;
  readonly content: string;
  readonly metadata: KnowledgeDocumentMetadata;
  readonly distance: number;
};

export type KnowledgeIngestResult = {
  readonly chunkCount: number;
  readonly fullText: string;
  readonly titleHint: string | null;
};

export type KnowledgeFacade = {
  ingest: (params: {
    readonly userId: string;
    readonly type: string;
    readonly refId: string;
    readonly title: string;
    readonly originalFilename: string | null;
    readonly mimeType: string | null;
    readonly bytes: Uint8Array;
  }) => ResultAsync<KnowledgeIngestResult, AppError>;

  retrieve: (params: {
    readonly userId: string;
    readonly query: string;
    readonly filter?: {
      readonly type?: string;
      readonly refIds?: ReadonlyArray<string>;
    };
    readonly limit?: number;
  }) => ResultAsync<ReadonlyArray<KnowledgeSearchResult>, AppError>;

  retrieveRange: (params: {
    readonly userId: string;
    readonly type: string;
    readonly refId: string;
    readonly startIndex: number;
    readonly endIndex: number;
  }) => ResultAsync<ReadonlyArray<KnowledgeSearchResult>, AppError>;

  countChunks: (params: {
    readonly userId: string;
    readonly type: string;
    readonly refId: string;
  }) => ResultAsync<number, AppError>;

  getChunkStats: (params: {
    readonly userId: string;
    readonly type: string;
    readonly refIds: ReadonlyArray<string>;
  }) => ResultAsync<Map<string, { chunkCount: number }>, AppError>;

  deleteByRef: (params: {
    readonly userId: string;
    readonly type: string;
    readonly refId: string;
  }) => ResultAsync<void, AppError>;
};

export type KnowledgeServiceDeps = {
  readonly databaseUrl: string | null | undefined;
  readonly embeddingModel: EmbeddingModelPort;
};

export function createKnowledgeService(
  deps: KnowledgeServiceDeps,
): KnowledgeFacade {
  const vectorStoreManager = createKnowledgeVectorStoreManager({
    databaseUrl: deps.databaseUrl,
    embeddingModel: deps.embeddingModel,
  });

  return createKnowledgeFacade({ vectorStoreManager });
}
