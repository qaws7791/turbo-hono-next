import type { ParsedSegment } from "./parse";

export type Chunk = {
  readonly id: string;
  readonly ordinal: number;
  readonly content: string;
  readonly tokenCount: number;
  readonly pageStart?: number;
  readonly pageEnd?: number;
  readonly sectionPath?: string;
};

export type ChunkOptions = {
  readonly targetTokens: number;
  readonly overlapTokens: number;
  readonly maxTokens: number;
};

const DEFAULT_OPTIONS: ChunkOptions = {
  targetTokens: 800,
  overlapTokens: 100,
  maxTokens: 1100,
};

const approxTokenCount = (text: string): number =>
  Math.max(1, Math.ceil(text.length / 4));

type WorkingChunk = {
  content: string;
  pageStart?: number;
  pageEnd?: number;
  sectionPath?: string;
};

function sliceByApproxTokens(
  text: string,
  opts: ChunkOptions,
): Array<{ content: string; tokenCount: number }> {
  const tokens = approxTokenCount(text);
  if (tokens <= opts.maxTokens) {
    return [{ content: text, tokenCount: tokens }];
  }

  const charsPerToken = 4;
  const maxChars = opts.maxTokens * charsPerToken;
  const overlapChars = opts.overlapTokens * charsPerToken;

  const parts: Array<{ content: string; tokenCount: number }> = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(text.length, start + maxChars);
    const slice = text.slice(start, end).trim();
    if (slice.length > 0) {
      parts.push({ content: slice, tokenCount: approxTokenCount(slice) });
    }
    if (end >= text.length) break;
    start = Math.max(0, end - overlapChars);
  }

  return parts;
}

export function chunkParsedSegments(
  segments: ReadonlyArray<ParsedSegment>,
  options?: Partial<ChunkOptions>,
): ReadonlyArray<Omit<Chunk, "id">> {
  const opts = { ...DEFAULT_OPTIONS, ...(options ?? {}) };

  const chunks: Array<Omit<Chunk, "id">> = [];
  let buffer: WorkingChunk | null = null;
  let ordinal = 0;

  const flush = (chunk: WorkingChunk) => {
    const parts = sliceByApproxTokens(chunk.content, opts);
    parts.forEach((part, idx) => {
      chunks.push({
        ordinal: ordinal + idx,
        content: part.content,
        tokenCount: part.tokenCount,
        pageStart: chunk.pageStart,
        pageEnd: chunk.pageEnd,
        sectionPath: chunk.sectionPath,
      });
    });
    ordinal += parts.length;
  };

  for (const segment of segments) {
    const text = segment.text.replace(/\s+/g, " ").trim();
    if (!text) continue;

    const candidate: string = buffer ? `${buffer.content}\n\n${text}` : text;
    const candidateTokens = approxTokenCount(candidate);

    if (!buffer) {
      buffer = {
        content: text,
        pageStart: segment.pageStart,
        pageEnd: segment.pageEnd,
        sectionPath: segment.sectionPath,
      };
      continue;
    }

    if (candidateTokens <= opts.targetTokens) {
      buffer = {
        content: candidate,
        pageStart: buffer.pageStart ?? segment.pageStart,
        pageEnd: segment.pageEnd ?? buffer.pageEnd,
        sectionPath: buffer.sectionPath ?? segment.sectionPath,
      };
      continue;
    }

    flush(buffer);
    buffer = {
      content: text,
      pageStart: segment.pageStart,
      pageEnd: segment.pageEnd,
      sectionPath: segment.sectionPath,
    };
  }

  if (buffer) flush(buffer);

  return chunks;
}
