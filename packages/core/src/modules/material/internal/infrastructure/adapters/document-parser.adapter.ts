import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import { coreError } from "../../../../../common/core-error";

import type { Document } from "@langchain/core/documents";
import type { DocumentParserPort } from "../../../api/ports";

type SupportedFileKind = "PDF" | "MARKDOWN" | "TEXT" | "DOCX";

class DocumentParser implements DocumentParserPort {
  isSupportedMaterialFile(params: {
    readonly mimeType: string | null;
    readonly originalFilename: string | null;
  }): boolean {
    return this.inferSupportedFileKind(params) !== null;
  }

  async parseFileBytesSource(source: {
    readonly bytes: Uint8Array;
    readonly mimeType: string | null;
    readonly originalFilename: string | null;
    readonly fileSize: number;
  }): Promise<{ readonly fullText: string }> {
    const kind = this.inferSupportedFileKind({
      mimeType: source.mimeType,
      originalFilename: source.originalFilename,
    });

    if (kind === "PDF") {
      const parsed = await this.parsePdf(source.bytes);
      return { fullText: parsed };
    }
    if (kind === "MARKDOWN" || kind === "TEXT") {
      const parsed = this.parseSimpleText(source.bytes);
      return { fullText: parsed };
    }
    if (kind === "DOCX") {
      const parsed = await this.parseDocx(source.bytes);
      return { fullText: parsed };
    }

    const ext = this.getFileExt(source.originalFilename);
    throw coreError({
      code: "MATERIAL_UNSUPPORTED_TYPE",
      message: "지원하지 않는 파일 형식입니다.",
      details: { mimeType: source.mimeType, ext },
    });
  }

  private parseSimpleText(bytes: Uint8Array): string {
    const text = Buffer.from(bytes).toString("utf8");
    const normalized = this.normalizeText(text);

    if (!normalized) {
      throw coreError({
        code: "MATERIAL_PARSE_FAILED",
        message: "텍스트를 추출할 수 없습니다.",
      });
    }

    return normalized;
  }

  private async parsePdf(bytes: Uint8Array): Promise<string> {
    const blob = new Blob([Buffer.from(bytes)], { type: "application/pdf" });
    const loader = new PDFLoader(blob, { splitPages: true });
    const docs = await loader.load();

    const fullText = docs
      .map((doc) => this.normalizeText(doc.pageContent))
      .filter((t) => t.length > 0)
      .join("\n\n");

    if (!fullText) {
      throw coreError({
        code: "MATERIAL_PARSE_FAILED",
        message: "PDF 텍스트를 추출할 수 없습니다.",
      });
    }

    return fullText;
  }

  private async parseDocx(bytes: Uint8Array): Promise<string> {
    const blob = new Blob([Buffer.from(bytes)], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const loader = new DocxLoader(blob);
    const docs = await loader.load();

    const text = this.normalizeText(
      docs.map((doc: Document) => doc.pageContent).join("\n\n"),
    );

    if (!text) {
      throw coreError({
        code: "MATERIAL_PARSE_FAILED",
        message: "DOCX 텍스트를 추출할 수 없습니다.",
      });
    }

    return text;
  }

  private normalizeText(value: string): string {
    return value.replace(/\0/g, "").replace(/\s+/g, " ").trim();
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
    const mime = params.mimeType?.split(";")[0]?.trim().toLowerCase() ?? null;

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

export function createDocumentParser(): DocumentParserPort {
  return new DocumentParser();
}
