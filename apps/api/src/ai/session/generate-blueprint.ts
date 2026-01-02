import { requireOpenAi } from "../../lib/openai";
import { ApiError } from "../../middleware/error-handler";
import { CONFIG } from "../../lib/config";

import { buildSystemPrompt, buildUserPrompt } from "./prompts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function generateSessionBlueprintWithAi(input: {
  readonly sessionType: "LEARN" | "REVIEW";
  readonly planTitle: string;
  readonly moduleTitle: string;
  readonly sessionTitle: string;
  readonly objective: string | null;
  readonly estimatedMinutes: number;
  readonly template: unknown;
}): Promise<Record<string, unknown>> {
  const openai = requireOpenAi();

  const completion = await openai.chat.completions.create({
    model: CONFIG.OPENAI_CHAT_MODEL,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      {
        role: "user",
        content: buildUserPrompt({
          sessionType: input.sessionType,
          planTitle: input.planTitle,
          moduleTitle: input.moduleTitle,
          sessionTitle: input.sessionTitle,
          objective: input.objective,
          estimatedMinutes: input.estimatedMinutes,
          template: input.template,
        }),
      },
    ],
    temperature: 0.3,
    max_tokens: 3000,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new ApiError(500, "AI_GENERATION_FAILED", "AI 응답이 없습니다.");
  }

  try {
    const parsed = JSON.parse(content);
    if (!isRecord(parsed)) {
      throw new ApiError(
        500,
        "AI_GENERATION_FAILED",
        "AI 응답이 올바른 JSON 객체가 아닙니다.",
      );
    }
    return parsed;
  } catch {
    throw new ApiError(
      500,
      "AI_GENERATION_FAILED",
      "AI 응답을 파싱할 수 없습니다.",
      { rawContent: content.slice(0, 500) },
    );
  }
}
