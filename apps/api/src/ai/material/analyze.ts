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

const OutlineNodeSchema: z.ZodType<MaterialOutlineNode> = z.lazy(() =>
  z.object({
    nodeType: z.enum(["SECTION", "TOPIC"]),
    title: z.string().min(1).max(200),
    summary: z.string().min(1).max(800),
    keywords: z
      .array(z.string().max(40))
      .max(15)
      .describe("해당 섹션의 핵심 키워드 리스트"),
    pageStart: z.number().int().min(1).nullable(),
    pageEnd: z.number().int().min(1).nullable(),
    lineStart: z.number().int().min(1).nullable(),
    lineEnd: z.number().int().min(1).nullable(),
    children: z.array(OutlineNodeSchema).max(40),
  }),
);

const AnalyzeMaterialResponseSchema = z.object({
  materialSummary: z.string().min(1).max(500),
  outline: z.array(OutlineNodeSchema).min(1).max(80),
});

export type AnalyzeMaterialParams = {
  readonly title: string;
  readonly fullText: string;
  readonly mimeType: string | null;
};

export type AnalyzeMaterialResult = {
  readonly summary: string;
  readonly outline: ReadonlyArray<MaterialOutlineNode>;
};

export async function analyzeMaterial(
  params: AnalyzeMaterialParams,
): Promise<AnalyzeMaterialResult> {
  const openai = requireOpenAi();

  const response = await openai.responses.parse({
    model: CONFIG.OPENAI_CHAT_MODEL,
    instructions: buildAnalyzeMaterialSystemPrompt(),
    input: buildAnalyzeMaterialUserPrompt({
      title: params.title,
      content: params.fullText,
      mimeType: params.mimeType,
    }),
    text: {
      format: zodTextFormat(AnalyzeMaterialResponseSchema, "material_analysis"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("AI 응답 파싱 실패");
  }

  return {
    summary: response.output_parsed.materialSummary,
    outline: response.output_parsed.outline,
  };
}
