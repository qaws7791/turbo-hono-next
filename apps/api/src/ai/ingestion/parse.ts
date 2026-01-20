import { createHash } from "node:crypto";

import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import { ApiError } from "../../middleware/error-handler";

import type { Document } from "@langchain/core/documents";

export type ParsedSegment = {
  readonly text: string;
  readonly pageStart?: number;
  readonly pageEnd?: number;
  readonly sectionPath?: string;
};

export type ParseResult = {
  readonly titleHint: string | null;
  readonly segments: ReadonlyArray<ParsedSegment>;
  readonly fullText: string;
  readonly pageCount?: number;
};

export type ParsedFile = {
  readonly bytes: Uint8Array;
  readonly checksumSha256Hex: string;
  readonly mimeType: string | null;
  readonly originalFilename: string | null;
  readonly fileSize: number;
};

export type FileBytesSource = {
  readonly bytes: Uint8Array;
  readonly mimeType: string | null;
  readonly originalFilename: string | null;
  readonly fileSize: number;
};

type SupportedFileKind = "PDF" | "MARKDOWN" | "TEXT" | "DOCX";

export class DocumentParser {
  async parseFileSource(file: File): Promise<{
    parsed: ParseResult;
    file: ParsedFile;
  }> {
    const parsedFile = await this.readUploadedFile(file);
    const parsed = await this.parseFileBytesSource({
      bytes: parsedFile.bytes,
      mimeType: parsedFile.mimeType,
      originalFilename: parsedFile.originalFilename,
      fileSize: parsedFile.fileSize,
    });
    return { parsed, file: parsedFile };
  }

  async parseFileBytesSource(source: FileBytesSource): Promise<ParseResult> {
    const kind = this.inferSupportedFileKind({
      mimeType: source.mimeType,
      originalFilename: source.originalFilename,
    });

    if (kind === "PDF") return this.parsePdf(source.bytes);
    if (kind === "MARKDOWN") return this.parseSimpleText(source.bytes);
    if (kind === "TEXT") return this.parseSimpleText(source.bytes);
    if (kind === "DOCX") return this.parseDocx(source.bytes);

    const ext = this.getFileExt(source.originalFilename);
    throw new ApiError(
      400,
      "MATERIAL_UNSUPPORTED_TYPE",
      "지원하지 않는 파일 형식입니다.",
      { mimeType: source.mimeType, ext },
    );
  }

  async readUploadedFile(file: File): Promise<ParsedFile> {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const checksumSha256Hex = createHash("sha256").update(bytes).digest("hex");
    return {
      bytes,
      checksumSha256Hex,
      mimeType: file.type || null,
      originalFilename: file.name || null,
      fileSize: file.size,
    };
  }

  isSupportedMaterialFile(params: {
    readonly mimeType: string | null;
    readonly originalFilename: string | null;
  }): boolean {
    return this.inferSupportedFileKind(params) !== null;
  }

  private async parseSimpleText(bytes: Uint8Array): Promise<ParseResult> {
    const text = Buffer.from(bytes)
      .toString("utf8")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      throw new ApiError(
        400,
        "MATERIAL_PARSE_FAILED",
        "텍스트를 추출할 수 없습니다.",
      );
    }

    return {
      titleHint: null,
      segments: [{ text }],
      fullText: text,
      pageCount: 1,
    };
  }

  private async parsePdf(bytes: Uint8Array): Promise<ParseResult> {
    const blob = new Blob([Buffer.from(bytes)], { type: "application/pdf" });
    const loader = new PDFLoader(blob, { splitPages: true });
    const docs = await loader.load();

    const pages: Array<ParsedSegment> = docs.map((doc) => ({
      text: doc.pageContent.replace(/\s+/g, " ").trim(),
      pageStart: doc.metadata.loc?.pageNumber,
      pageEnd: doc.metadata.loc?.pageNumber,
    }));

    const fullText = pages
      .map((p) => p.text)
      .filter((t) => t.length > 0)
      .join("\n\n");

    if (!fullText) {
      throw new ApiError(
        400,
        "MATERIAL_PARSE_FAILED",
        "PDF 텍스트를 추출할 수 없습니다.",
      );
    }

    const totalPages =
      docs.length > 0 ? (docs[0]?.metadata.pdf?.totalPages ?? docs.length) : 0;

    return {
      titleHint: null,
      segments: pages,
      fullText,
      pageCount: totalPages,
    };
  }

  private async parseDocx(bytes: Uint8Array): Promise<ParseResult> {
    const blob = new Blob([Buffer.from(bytes)], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const loader = new DocxLoader(blob);
    const docs = await loader.load();

    const text = docs
      .map((doc: Document) => doc.pageContent)
      .join("\n\n")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      throw new ApiError(
        400,
        "MATERIAL_PARSE_FAILED",
        "DOCX 텍스트를 추출할 수 없습니다.",
      );
    }

    return {
      titleHint: null,
      segments: [{ text }],
      fullText: text,
      pageCount: 1,
    };
  }

  private getFileExt(filename: string | null): string | null {
    if (!filename) return null;
    const idx = filename.lastIndexOf(".");
    if (idx === -1) return null;
    return filename.slice(idx + 1).toLowerCase();
  }

  private inferSupportedFileKind(params: {
    readonly mimeType: string | null;
    readonly originalFilename: string | null;
  }): SupportedFileKind | null {
    const ext = this.getFileExt(params.originalFilename);
    const mime = params.mimeType;

    if (mime === "application/pdf" || ext === "pdf") return "PDF";
    if (mime === "text/markdown" || ext === "md" || ext === "markdown") {
      return "MARKDOWN";
    }
    if (mime === "text/plain" || ext === "txt") return "TEXT";
    if (
      mime ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ext === "docx"
    ) {
      return "DOCX";
    }

    return null;
  }
}

export const documentParser = new DocumentParser();
