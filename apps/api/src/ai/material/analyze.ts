import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { CONFIG } from "../../lib/config";
import { requireOpenAi } from "../../lib/openai";

import {
  buildAnalyzeMaterialSystemPrompt,
  buildAnalyzeMaterialUserPrompt,
} from "./analyze-prompts";

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

const NodeTypeSchema = z
  .enum(["SECTION", "TOPIC"])
  .describe("SECTION=큰 흐름/챕터, TOPIC=세부 개념/기법/절차");

const TitleSchema = z
  .string()
  .min(1)
  .max(200)
  .describe("원문 헤딩 우선, 없으면 내용을 대표하는 제목");

const SummarySchema = z
  .string()
  .min(1)
  .max(4000)
  .describe(
    "해당 노드만 읽어도 이해되는 self-contained 학습 요약 (정의/절차/예시/주의점/실무 연결 포함)",
  );

const KeywordSchema = z
  .string()
  .min(1)
  .max(60)
  .describe("검색/복습용 핵심 개념어 (중복 금지, 너무 일반적인 단어 금지)");

const KeywordsSchema = z
  .array(KeywordSchema)
  .max(12)
  .describe("권장 3~7개, 없으면 빈 배열");

const PageNumberSchema = z
  .number()
  .int()
  .min(1)
  .nullable()
  .describe("페이지 번호 (원문에 명시적 표기가 없으면 null)");

const LineNumberSchema = z
  .number()
  .int()
  .min(1)
  .nullable()
  .describe("라인 번호 (원문에 명시적 표기가 없으면 null)");

const OutlineNodeSchema: z.ZodType<MaterialOutlineNode> = z.lazy(() =>
  z.object({
    nodeType: NodeTypeSchema,
    title: TitleSchema,
    summary: SummarySchema,
    keywords: KeywordsSchema,
    pageStart: PageNumberSchema,
    pageEnd: PageNumberSchema,
    lineStart: LineNumberSchema,
    lineEnd: LineNumberSchema,
    children: z
      .array(OutlineNodeSchema)
      .max(25)
      .describe("하위 섹션/토픽 (없으면 빈 배열)"),
  }),
);

const AnalyzeMaterialResponseSchema = z.object({
  materialTitle: z
    .string()
    .min(1)
    .max(50)
    .describe(
      "자료의 내용을 가장 잘 대변하는 명확하고 간결한 제목 (파일명이 아닌 실제 콘텐츠 기반)",
    ),
  materialSummary: z
    .string()
    .min(1)
    .max(4000)
    .describe(
      "자료 전체 심층 요약 (학습 노트 수준: 목적/핵심 개념/학습 순서/주의점/적용 포인트 포함)",
    ),
  outline: z
    .array(OutlineNodeSchema)
    .min(1)
    .max(80)
    .describe("자료의 문서 지도 트리 (상위 섹션 4~12개 권장)"),
});

export type AnalyzeMaterialParams = {
  readonly fullText: string;
  readonly mimeType: string | null;
};

export type AnalyzeMaterialResult = {
  readonly title: string;
  readonly summary: string;
  readonly outline: ReadonlyArray<MaterialOutlineNode>;
};

function normalizeKeywordList(
  keywords: ReadonlyArray<string>,
): ReadonlyArray<string> {
  const result: Array<string> = [];
  const seen = new Set<string>();

  for (const keyword of keywords) {
    const trimmed = keyword.trim();
    if (!trimmed.length) continue;
    const normalized = trimmed.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(trimmed);
  }

  return result;
}

function normalizeNullableRange(params: {
  readonly start: number | null;
  readonly end: number | null;
}): { readonly start: number | null; readonly end: number | null } {
  if (params.start === null && params.end === null) {
    return { start: null, end: null };
  }

  const start = params.start ?? params.end;
  const end = params.end ?? params.start;
  if (start === null || end === null) {
    return { start: null, end: null };
  }

  if (start <= end) return { start, end };
  return { start: end, end: start };
}

function normalizeOutlineNode(node: MaterialOutlineNode): MaterialOutlineNode {
  const page = normalizeNullableRange({
    start: node.pageStart,
    end: node.pageEnd,
  });
  const line = normalizeNullableRange({
    start: node.lineStart,
    end: node.lineEnd,
  });

  return {
    nodeType: node.nodeType,
    title: node.title.trim(),
    summary: node.summary.trim(),
    keywords: normalizeKeywordList(node.keywords),
    pageStart: page.start,
    pageEnd: page.end,
    lineStart: line.start,
    lineEnd: line.end,
    children: node.children.map(normalizeOutlineNode),
  };
}

export async function analyzeMaterial(
  params: AnalyzeMaterialParams,
): Promise<AnalyzeMaterialResult> {
  const openai = requireOpenAi();

  const systemPrompt = buildAnalyzeMaterialSystemPrompt();
  const userPrompt = buildAnalyzeMaterialUserPrompt({
    content: params.fullText,
    mimeType: params.mimeType,
  });

  const tryParse = async (
    extraInstructions: string | null,
  ): Promise<z.infer<typeof AnalyzeMaterialResponseSchema>> => {
    const instructions = extraInstructions
      ? `${systemPrompt}\n\n${extraInstructions}`
      : systemPrompt;

    const response = await openai.responses.parse({
      model: CONFIG.OPENAI_CHAT_MODEL,
      instructions,
      input: userPrompt,
      text: {
        format: zodTextFormat(
          AnalyzeMaterialResponseSchema,
          "material_analysis",
        ),
      },
    });

    if (!response.output_parsed) {
      throw new Error("AI 응답 파싱 실패");
    }

    return response.output_parsed;
  };

  const parsed = await tryParse(null).catch(() =>
    tryParse(
      [
        "이전 응답이 JSON 스키마를 만족하지 못했습니다.",
        "오직 JSON만 출력하고, 모든 필드를 빠짐없이 포함하세요.",
        "원문에 명시적 페이지/라인 표기가 없다면 위치 관련 필드는 반드시 null로 두세요.",
      ].join("\n"),
    ),
  );

  return {
    title: parsed.materialTitle.trim(),
    summary: parsed.materialSummary.trim(),
    outline: parsed.outline.map(normalizeOutlineNode),
  };
}
