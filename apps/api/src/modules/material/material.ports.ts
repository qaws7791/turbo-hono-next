import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../lib/result";
import type { MaterialSourceType } from "./material.dto";

export type DocumentParserPort = {
  isSupportedMaterialFile: (params: {
    readonly mimeType: string | null;
    readonly originalFilename: string | null;
  }) => boolean;
  inferMaterialSourceTypeFromFile: (params: {
    readonly mimeType: string | null;
    readonly originalFilename: string | null;
  }) => MaterialSourceType | null;
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
  }) => Promise<{
    readonly title: string;
    readonly summary: string;
    readonly outline: ReadonlyArray<MaterialOutlineNode>;
  }>;
};

export type RagIngestorPort = {
  ingest: (params: {
    readonly userId: string;
    readonly materialId: string;
    readonly materialTitle: string;
    readonly originalFilename: string | null;
    readonly mimeType: string | null;
    readonly bytes: Uint8Array;
  }) => Promise<unknown>;
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
  }) => Promise<{ url: string }>;
  headObject: (params: { readonly key: string }) => Promise<{
    size: number | null;
    contentType: string | null;
    etag: string | null;
  }>;
  getObjectBytes: (params: { readonly key: string }) => Promise<Uint8Array>;
  copyObject: (params: {
    readonly sourceKey: string;
    readonly destinationKey: string;
    readonly contentType: string | null;
  }) => Promise<void>;
  deleteObject: (params: { readonly key: string }) => Promise<void>;
};
