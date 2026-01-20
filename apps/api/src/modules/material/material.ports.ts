import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../lib/result";

export type DocumentParserPort = {
  isSupportedMaterialFile: (params: {
    readonly mimeType: string | null;
    readonly originalFilename: string | null;
  }) => boolean;

  parseFileBytesSource: (source: {
    readonly bytes: Uint8Array;
    readonly mimeType: string | null;
    readonly originalFilename: string | null;
    readonly fileSize: number;
  }) => Promise<{
    readonly fullText: string;
  }>;
};

export type MaterialOutlineNode = {
  readonly nodeType: "SECTION" | "TOPIC";
  readonly title: string;
  readonly summary: string;
  readonly keywords: ReadonlyArray<string>;
  readonly pageStart: number | null;
  readonly pageEnd: number | null;
  readonly lineStart: number | null;
  readonly lineEnd: number | null;
  readonly children: ReadonlyArray<MaterialOutlineNode>;
};

export type MaterialAnalyzerPort = {
  analyze: (params: {
    readonly fullText: string;
    readonly mimeType: string | null;
  }) => ResultAsync<
    {
      readonly title: string;
      readonly summary: string;
      readonly outline: ReadonlyArray<MaterialOutlineNode>;
    },
    AppError
  >;
};

export type RagIngestResult = {
  readonly chunkCount: number;
  readonly fullText: string;
  readonly titleHint: string | null;
};

export type RagIngestorPort = {
  ingest: (params: {
    readonly userId: string;
    readonly materialId: string;
    readonly materialTitle: string;
    readonly originalFilename: string | null;
    readonly mimeType: string | null;
    readonly bytes: Uint8Array;
  }) => ResultAsync<RagIngestResult, AppError>;
};

export type RagRetrieverForMaterialPort = {
  countMaterialChunks: (params: {
    readonly userId: string;
    readonly materialId: string;
  }) => ResultAsync<number, AppError>;
};

export type RagVectorStoreManagerForMaterialPort = {
  getStoreForUser: (params: { readonly userId: string }) => Promise<{
    delete: (params: {
      filter: { readonly userId: string; readonly materialId: string };
    }) => Promise<void>;
  }>;
};

export type R2StoragePort = {
  createPresignedPutUrl: (params: {
    readonly key: string;
    readonly contentType: string;
    readonly expiresInSeconds: number;
  }) => ResultAsync<{ url: string }, AppError>;
  headObject: (params: { readonly key: string }) => ResultAsync<
    {
      size: number | null;
      contentType: string | null;
      etag: string | null;
    },
    AppError
  >;
  getObjectBytes: (params: {
    readonly key: string;
  }) => ResultAsync<Uint8Array, AppError>;
  copyObject: (params: {
    readonly sourceKey: string;
    readonly destinationKey: string;
    readonly contentType: string | null;
  }) => ResultAsync<void, AppError>;
  deleteObject: (params: {
    readonly key: string;
  }) => ResultAsync<void, AppError>;
};
