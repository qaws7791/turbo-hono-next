import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { ApiError } from "../../middleware/error-handler";

import { ragVectorStoreManager } from "./vector-store";

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

type SupportedFileKind = "PDF" | "DOCX" | "TEXT" | "MARKDOWN";

export class RagIngestor {
  private splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  public async ingest(
    params: IngestMaterialParams,
  ): Promise<IngestMaterialResult> {
    const baseDocs = await this.loadDocuments({
      bytes: params.bytes,
      mimeType: params.mimeType,
      originalFilename: params.originalFilename,
    });

    const fullText = this.normalizeText(
      baseDocs.map((d) => d.pageContent).join("\n\n"),
    );

    if (!fullText) {
      throw new ApiError(
        400,
        "MATERIAL_PARSE_FAILED",
        "문서에서 텍스트를 추출할 수 없습니다.",
      );
    }

    const splitDocs = await this.splitter.splitDocuments(Array.from(baseDocs));
    if (splitDocs.length === 0) {
      throw new ApiError(
        400,
        "MATERIAL_PARSE_FAILED",
        "문서를 청크로 분할할 수 없습니다.",
      );
    }

    const ragDocs: Array<Document<Record<string, unknown>>> = [];
    splitDocs.forEach((doc, chunkIndex) => {
      const content = this.normalizeText(doc.pageContent);
      if (!content) return;

      const pageNumber = this.extractPageNumber(doc.metadata);
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
        new Document<Record<string, unknown>>({
          pageContent: content,
          metadata,
        }),
      );
    });

    if (ragDocs.length === 0) {
      throw new ApiError(
        400,
        "MATERIAL_PARSE_FAILED",
        "문서를 청크로 변환할 수 없습니다.",
      );
    }

    const store = await ragVectorStoreManager.getStoreForUser({
      userId: params.userId,
    });

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

  private async loadDocuments(params: {
    readonly bytes: Uint8Array;
    readonly mimeType: string | null;
    readonly originalFilename: string | null;
  }): Promise<ReadonlyArray<Document>> {
    const kind = this.inferSupportedFileKind(params);

    if (kind === "PDF") {
      const blob = new Blob([Buffer.from(params.bytes)], {
        type: "application/pdf",
      });
      const loader = new PDFLoader(blob);
      return loader.load();
    }

    if (kind === "DOCX") {
      const blob = new Blob([Buffer.from(params.bytes)], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const loader = new DocxLoader(blob);
      return loader.load();
    }

    if (kind === "TEXT" || kind === "MARKDOWN") {
      const text = this.normalizeText(
        Buffer.from(params.bytes).toString("utf8"),
      );
      if (!text) {
        return [];
      }
      return [
        new Document({
          pageContent: text,
          metadata: { source: "inline" },
        }),
      ];
    }

    const ext = this.getFileExt(params.originalFilename);
    throw new ApiError(
      400,
      "MATERIAL_UNSUPPORTED_TYPE",
      "지원하지 않는 파일 형식입니다.",
      { mimeType: params.mimeType, ext },
    );
  }

  private inferSupportedFileKind(params: {
    readonly mimeType: string | null;
    readonly originalFilename: string | null;
  }): SupportedFileKind | null {
    const ext = this.getFileExt(params.originalFilename);
    const mime = params.mimeType?.split(";")[0]?.trim().toLowerCase() ?? null;

    if (mime === "application/pdf" || ext === "pdf") return "PDF";
    if (
      mime ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ext === "docx"
    ) {
      return "DOCX";
    }
    if (mime === "text/markdown" || ext === "md" || ext === "markdown") {
      return "MARKDOWN";
    }
    if (mime === "text/plain" || ext === "txt") return "TEXT";

    return null;
  }

  private getFileExt(filename: string | null): string | null {
    if (!filename) return null;
    const idx = filename.lastIndexOf(".");
    if (idx === -1) return null;
    return filename.slice(idx + 1).toLowerCase();
  }

  private normalizeText(value: string): string {
    return value.replace(/\0/g, "").replace(/\s+/g, " ").trim();
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  private extractPageNumber(metadata: Record<string, unknown>): number | null {
    const loc = metadata.loc;
    if (!this.isRecord(loc)) return null;
    const pageNumber = loc.pageNumber;
    return typeof pageNumber === "number" ? pageNumber : null;
  }
}

export const ragIngestor = new RagIngestor();
