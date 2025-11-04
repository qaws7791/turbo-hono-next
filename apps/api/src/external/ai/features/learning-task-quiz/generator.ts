import { LearningTaskQuizSchema } from "@repo/api-spec/modules/ai/schema";
import { generateObject } from "ai";

import { geminiModel } from "../../provider";

import { generateLearningTaskQuizPrompt } from "./prompt";

import type { z } from "zod";
import type { LearningTaskQuizPromptInput } from "./prompt";

export interface LearningTaskQuizQuestion {
  id: string;
  prompt: string;
  options: Array<string>;
  answerIndex: number;
  explanation: string;
}

export interface GenerateLearningTaskQuizParams {
  promptInput: LearningTaskQuizPromptInput;
}

export type LearningTaskQuiz = z.infer<typeof LearningTaskQuizSchema>;

/**
 * Google Gemini를 사용하여 학습 퀴즈를 생성합니다.
 *
 * @param params - 프롬프트 입력
 * @returns 생성된 퀴즈 문제 배열
 * @throws AI 생성 실패 시 에러 발생
 */
export async function generateLearningTaskQuiz(
  params: GenerateLearningTaskQuizParams,
): Promise<Array<LearningTaskQuizQuestion>> {
  const { promptInput } = params;

  const prompt = generateLearningTaskQuizPrompt(promptInput);

  const result = await generateObject({
    model: geminiModel,
    schema: LearningTaskQuizSchema,
    temperature: 0.4,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  });

  const questions = result.object?.questions ?? null;

  if (!questions || questions.length === 0) {
    throw new Error("AI quiz generation failed: No questions returned");
  }

  return questions;
}
