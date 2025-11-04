import { GeneratedLearningPlanSchema } from "@repo/api-spec/modules/ai/schema";
import { generateObject } from "ai";

import { geminiModel } from "../../provider";

import { generateLearningPlanPrompt } from "./prompt";

import type { ModelMessage } from "ai";
import type { z } from "zod";
import type { LearningPlanPromptData } from "./prompt";

export interface GenerateLearningPlanParams {
  promptData: LearningPlanPromptData;
  pdfContents?: ArrayBuffer | null;
}

export type GeneratedLearningPlan = z.infer<typeof GeneratedLearningPlanSchema>;

/**
 * Google Gemini를 사용하여 학습 계획을 생성합니다.
 *
 * @param params - 프롬프트 데이터 및 선택적 PDF 내용
 * @returns 생성된 학습 계획 객체
 * @throws AI 생성 실패 시 에러 발생
 */
export async function generateLearningPlan(
  params: GenerateLearningPlanParams,
): Promise<GeneratedLearningPlan> {
  const { promptData, pdfContents } = params;

  const prompt = generateLearningPlanPrompt(promptData);

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
    schema: GeneratedLearningPlanSchema,
    temperature: 0.7,
    messages: messages,
  });

  if (!result.object) {
    throw new Error("AI generation failed: No object returned");
  }

  return result.object;
}
