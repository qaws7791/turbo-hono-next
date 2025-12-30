import { createHash } from "node:crypto";

import { ApiError } from "../../middleware/error-handler";

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

export async function readUploadedFile(file: File): Promise<ParsedFile> {
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

export async function parseTextSource(text: string): Promise<ParseResult> {
  const normalized = text.trim();
  return {
    titleHint: null,
    segments: [{ text: normalized }],
    fullText: normalized,
  };
}

type PdfTextItem = { readonly str: string };
const isPdfTextItem = (value: unknown): value is PdfTextItem => {
  if (!value || typeof value !== "object") return false;
  return typeof (value as { str?: unknown }).str === "string";
};

async function parsePdf(bytes: Uint8Array): Promise<ParseResult> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjs.getDocument({ data: bytes });
  const pdf = await loadingTask.promise;

  const pages: Array<ParsedSegment> = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: unknown) => (isPdfTextItem(item) ? item.str : ""))
      .filter((s: string) => s.trim().length > 0)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length > 0) {
      pages.push({ text, pageStart: i, pageEnd: i });
    }
  }

  await pdf.destroy();

  const fullText = pages.map((p) => p.text).join("\n\n");
  if (!fullText) {
    throw new ApiError(
      400,
      "MATERIAL_PARSE_FAILED",
      "PDF 텍스트를 추출할 수 없습니다.",
    );
  }

  return {
    titleHint: null,
    segments: pages,
    fullText,
    pageCount: pdf.numPages,
  };
}

async function parseDocx(bytes: Uint8Array): Promise<ParseResult> {
  const mammothModule = await import("mammoth");
  const mammoth = mammothModule as unknown as {
    extractRawText: (options: { buffer: Buffer }) => Promise<{ value: string }>;
  };

  const { value } = await mammoth.extractRawText({
    buffer: Buffer.from(bytes),
  });
  const text = value.replace(/\s+/g, " ").trim();
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
  };
}

function getFileExt(filename: string | null): string | null {
  if (!filename) return null;
  const idx = filename.lastIndexOf(".");
  if (idx === -1) return null;
  return filename.slice(idx + 1).toLowerCase();
}

type SupportedFileKind = "PDF" | "MARKDOWN" | "TEXT" | "DOCX";

function inferSupportedFileKind(params: {
  readonly mimeType: string | null;
  readonly originalFilename: string | null;
}): SupportedFileKind | null {
  const ext = getFileExt(params.originalFilename);
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

export type MaterialSourceType = "FILE" | "TEXT";

export function inferMaterialSourceTypeFromFile(params: {
  readonly mimeType: string | null;
  readonly originalFilename: string | null;
}): MaterialSourceType | null {
  const kind = inferSupportedFileKind(params);
  if (kind === "PDF" || kind === "DOCX") return "FILE";
  if (kind === "MARKDOWN" || kind === "TEXT") return "TEXT";
  return null;
}

export function isSupportedMaterialFile(params: {
  readonly mimeType: string | null;
  readonly originalFilename: string | null;
}): boolean {
  return inferSupportedFileKind(params) !== null;
}

export async function parseFileBytesSource(
  source: FileBytesSource,
): Promise<ParseResult> {
  const kind = inferSupportedFileKind({
    mimeType: source.mimeType,
    originalFilename: source.originalFilename,
  });

  if (kind === "PDF") return parsePdf(source.bytes);
  if (kind === "MARKDOWN" || kind === "TEXT") {
    const text = Buffer.from(source.bytes).toString("utf8").trim();
    return parseTextSource(text);
  }
  if (kind === "DOCX") return parseDocx(source.bytes);

  const ext = getFileExt(source.originalFilename);
  throw new ApiError(
    400,
    "MATERIAL_UNSUPPORTED_TYPE",
    "지원하지 않는 파일 형식입니다.",
    { mimeType: source.mimeType, ext },
  );
}

export async function parseFileSource(file: File): Promise<{
  parsed: ParseResult;
  file: ParsedFile;
}> {
  const parsedFile = await readUploadedFile(file);
  const parsed = await parseFileBytesSource({
    bytes: parsedFile.bytes,
    mimeType: parsedFile.mimeType,
    originalFilename: parsedFile.originalFilename,
    fileSize: parsedFile.fileSize,
  });
  return { parsed, file: parsedFile };
}
