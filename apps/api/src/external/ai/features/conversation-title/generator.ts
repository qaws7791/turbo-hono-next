import { generateText } from "ai";

import { geminiModel } from "../../provider";

import {
  buildTitleGenerationSystemPrompt,
  buildTitleGenerationUserPrompt,
} from "./prompt";

export async function generateConversationTitle(
  userMessage: string,
): Promise<string> {
  try {
    const result = await generateText({
      model: geminiModel,
      system: buildTitleGenerationSystemPrompt(),
      prompt: buildTitleGenerationUserPrompt(userMessage),
      temperature: 0.3,
    });

    return result.text.trim() || "새 대화";
  } catch (error) {
    console.error("Failed to generate conversation title:", error);
    return "새 대화";
  }
}
