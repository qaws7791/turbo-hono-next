import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { CONFIG } from "../../lib/config";
import { ApiError } from "../../middleware/error-handler";

import { loadDocumentsFromBytes } from "./load";
import { getVectorStoreForUser } from "./vector-store";

export type IngestMaterialParams = {
  readonly userId: string;
  readonly materialId: string;
  readonly materialTitle: string;
  readonly originalFilename: string | null;
  readonly mimeType: string | null;
  readonly bytes: Uint8Array;
};

export type IngestMaterialResult = {
  readonly chunkCount: number;
  readonly fullText: string;
  readonly titleHint: string | null;
};

function requireOpenAiForRag(): void {
  if (!CONFIG.OPENAI_API_KEY) {
    throw new ApiError(
      503,
      "AI_SERVICE_UNAVAILABLE",
      "AI 서비스가 설정되지 않았습니다.",
    );
  }
}

function normalizeText(value: string): string {
  return value.replace(/\0/g, "").replace(/\s+/g, " ").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function extractPageNumber(metadata: Record<string, unknown>): number | null {
  const loc = metadata.loc;
  if (!isRecord(loc)) return null;
  const pageNumber = loc.pageNumber;
  return typeof pageNumber === "number" ? pageNumber : null;
}

export async function ingestMaterial(
  params: IngestMaterialParams,
): Promise<IngestMaterialResult> {
  requireOpenAiForRag();

  const baseDocs = await loadDocumentsFromBytes({
    bytes: params.bytes,
    mimeType: params.mimeType,
    originalFilename: params.originalFilename,
  });

  const fullText = normalizeText(
    baseDocs.map((d) => d.pageContent).join("\n\n"),
  );

  if (!fullText) {
    throw new ApiError(
      400,
      "MATERIAL_PARSE_FAILED",
      "문서에서 텍스트를 추출할 수 없습니다.",
    );
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await splitter.splitDocuments(Array.from(baseDocs));
  if (splitDocs.length === 0) {
    throw new ApiError(
      400,
      "MATERIAL_PARSE_FAILED",
      "문서를 청크로 분할할 수 없습니다.",
    );
  }

  const ragDocs: Array<Document<Record<string, unknown>>> = [];
  splitDocs.forEach((doc, chunkIndex) => {
    const content = normalizeText(doc.pageContent);
    if (!content) return;

    const pageNumber = extractPageNumber(doc.metadata);
    const metadata: Record<string, unknown> = {
      userId: params.userId,
      materialId: params.materialId,
      materialTitle: params.materialTitle,
      originalFilename: params.originalFilename,
      mimeType: params.mimeType,
      source: "material",
      chunkIndex,
      ...(pageNumber ? { pageNumber } : {}),
    };

    ragDocs.push(
      new Document<Record<string, unknown>>({ pageContent: content, metadata }),
    );
  });

  if (ragDocs.length === 0) {
    throw new ApiError(
      400,
      "MATERIAL_PARSE_FAILED",
      "문서를 청크로 변환할 수 없습니다.",
    );
  }

  const store = await getVectorStoreForUser({ userId: params.userId });

  // Re-indexing: delete existing docs for this material.
  await store.delete({
    filter: {
      userId: params.userId,
      materialId: params.materialId,
    },
  });

  await store.addDocuments(ragDocs);

  return {
    chunkCount: ragDocs.length,
    fullText,
    titleHint: null,
  };
}
