import { PlanRecommendationsResponseSchema } from "@repo/api-spec/modules/ai/schema";
import { generateObject } from "ai";

import { geminiModel } from "../../provider";

import { generateDefaultsSuggestionPrompt } from "./prompt";

import type { ModelMessage } from "ai";
import type { z } from "zod";
import type { DefaultsSuggestionPromptData } from "./prompt";

export interface GenerateDefaultsSuggestionParams {
  promptData: DefaultsSuggestionPromptData;
  pdfContents?: ArrayBuffer | null;
}

export type SuggestedDefaults = z.infer<
  typeof PlanRecommendationsResponseSchema
>;

/**
 * Google Gemini를 사용하여 학습 계획 생성을 위한 스마트 기본값을 추천합니다.
 *
 * @param params - 프롬프트 데이터 및 선택적 PDF 내용
 * @returns AI가 추천한 기본값 객체
 * @throws AI 생성 실패 시 에러 발생
 */
export async function generateDefaultsSuggestion(
  params: GenerateDefaultsSuggestionParams,
): Promise<SuggestedDefaults> {
  const { promptData, pdfContents } = params;

  const prompt = generateDefaultsSuggestionPrompt(promptData);

  const messages: Array<ModelMessage> = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: prompt,
        },
      ],
    },
  ];

  if (pdfContents) {
    messages.push({
      role: "user",
      content: [
        {
          type: "file",
          data: Buffer.from(pdfContents),
          mediaType: "application/pdf",
        },
      ],
    });
  }

  const result = await generateObject({
    model: geminiModel,
    schema: PlanRecommendationsResponseSchema,
    temperature: 0.5, // Lower temperature for more consistent recommendations
    messages: messages,
  });

  if (!result.object) {
    throw new Error("AI defaults suggestion failed: No object returned");
  }

  return result.object;
}
