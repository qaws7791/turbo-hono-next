import { Document } from "@langchain/core/documents";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import { ApiError } from "../../middleware/error-handler";

import { withTempFile } from "./temp-file";

type SupportedFileKind = "PDF" | "DOCX" | "TEXT" | "MARKDOWN";

function getFileExt(filename: string | null): string | null {
  if (!filename) return null;
  const idx = filename.lastIndexOf(".");
  if (idx === -1) return null;
  return filename.slice(idx + 1).toLowerCase();
}

function inferSupportedFileKind(params: {
  readonly mimeType: string | null;
  readonly originalFilename: string | null;
}): SupportedFileKind | null {
  const ext = getFileExt(params.originalFilename);
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

function normalizeText(value: string): string {
  return value.replace(/\0/g, "").replace(/\s+/g, " ").trim();
}

export async function loadDocumentsFromBytes(params: {
  readonly bytes: Uint8Array;
  readonly mimeType: string | null;
  readonly originalFilename: string | null;
}): Promise<ReadonlyArray<Document>> {
  const kind = inferSupportedFileKind(params);

  if (kind === "PDF") {
    return withTempFile({ bytes: params.bytes, extension: ".pdf" }, async (p) =>
      new PDFLoader(p).load(),
    );
  }

  if (kind === "DOCX") {
    return withTempFile(
      { bytes: params.bytes, extension: ".docx" },
      async (p) => new DocxLoader(p).load(),
    );
  }

  if (kind === "TEXT" || kind === "MARKDOWN") {
    const text = normalizeText(Buffer.from(params.bytes).toString("utf8"));
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

  const ext = getFileExt(params.originalFilename);
  throw new ApiError(
    400,
    "MATERIAL_UNSUPPORTED_TYPE",
    "지원하지 않는 파일 형식입니다.",
    { mimeType: params.mimeType, ext },
  );
}
