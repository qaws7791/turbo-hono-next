import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { CONFIG } from "../../lib/config";
import { requireOpenAi } from "../../lib/openai";

import {
  buildSummarizeSystemPrompt,
  buildSummarizeUserPrompt,
} from "./prompts";

/**
 * AI 응답 스키마
 */
const SummaryResponseSchema = z.object({
  summary: z
    .string()
    .min(1)
    .max(500)
    .describe("학습 자료 요약 (2-3문장, 500자 이내)"),
});

export type GenerateSummaryParams = {
  readonly title: string;
  readonly fullText: string;
  readonly mimeType: string | null;
};

export type GenerateSummaryResult = {
  readonly summary: string;
  readonly isAiGenerated: boolean;
};

/**
 * 폴백 요약 생성 (기존 방식)
 */
function createFallbackSummary(fullText: string): string {
  const trimmed = fullText.slice(0, 240).trim();
  return trimmed || "요약을 생성할 수 없습니다.";
}

/**
 * AI를 사용하여 학습 자료 요약 생성
 *
 * OpenAI Structured Outputs를 사용하여 스키마 준수 보장
 * GPT 모델을 활용하여 학습 자료의 전체 내용을 분석하고
 * 핵심 내용을 2-3문장으로 요약합니다.
 *
 * @param params.title - 자료 제목
 * @param params.fullText - 전체 텍스트 (토큰 제한을 위해 앞부분만 사용)
 * @param params.mimeType - MIME 타입
 * @returns 요약 결과 (AI 생성 여부 포함)
 */
export async function generateMaterialSummary(
  params: GenerateSummaryParams,
): Promise<GenerateSummaryResult> {
  try {
    const openai = requireOpenAi();

    const response = await openai.responses.parse({
      model: CONFIG.OPENAI_CHAT_MODEL,
      instructions: buildSummarizeSystemPrompt(),
      input: buildSummarizeUserPrompt({
        title: params.title,
        content: params.fullText,
        mimeType: params.mimeType,
      }),
      text: {
        format: zodTextFormat(SummaryResponseSchema, "material_summary"),
      },
    });

    if (!response.output_parsed) {
      console.warn("[generateMaterialSummary] AI 응답 파싱 실패, 폴백 사용");
      return {
        summary: createFallbackSummary(params.fullText),
        isAiGenerated: false,
      };
    }

    return {
      summary: response.output_parsed.summary,
      isAiGenerated: true,
    };
  } catch (error) {
    console.warn(
      "[generateMaterialSummary] AI 요약 생성 실패, 폴백 사용:",
      error,
    );
    return {
      summary: createFallbackSummary(params.fullText),
      isAiGenerated: false,
    };
  }
}
