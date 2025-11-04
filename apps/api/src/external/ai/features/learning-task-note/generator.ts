import { LearningTaskNoteContentSchema } from "@repo/api-spec/modules/ai/schema";
import { generateObject } from "ai";

import { geminiModel } from "../../provider";

import { generateLearningTaskNotePrompt } from "./prompt";

import type { ModelMessage } from "ai";
import type { z } from "zod";
import type { LearningTaskNotePromptInput } from "./prompt";

export interface DocumentFile {
  fileName: string;
  mediaType: string;
  buffer: Buffer;
}

export interface GenerateLearningTaskNoteParams {
  promptInput: LearningTaskNotePromptInput;
  documentFiles?: Array<DocumentFile>;
}

export type LearningTaskNoteContent = z.infer<
  typeof LearningTaskNoteContentSchema
>;

/**
 * Google Gemini를 사용하여 학습 노트를 생성합니다.
 *
 * @param params - 프롬프트 입력 및 선택적 문서 파일들
 * @returns 생성된 학습 노트 (마크다운)
 * @throws AI 생성 실패 시 에러 발생
 */
export async function generateLearningTaskNote(
  params: GenerateLearningTaskNoteParams,
): Promise<string> {
  const { promptInput, documentFiles = [] } = params;

  const prompt = generateLearningTaskNotePrompt(promptInput);
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

  for (const file of documentFiles) {
    messages.push({
      role: "user",
      content: [
        {
          type: "file",
          data: file.buffer,
          mediaType: file.mediaType || "application/pdf",
          filename: file.fileName,
        },
      ],
    });
  }

  const result = await generateObject({
    model: geminiModel,
    schema: LearningTaskNoteContentSchema,
    temperature: 0.6,
    messages,
  });

  const markdown = result.object?.markdown?.trim();

  if (!markdown) {
    throw new Error("AI note generation failed: No markdown returned");
  }

  return markdown;
}
