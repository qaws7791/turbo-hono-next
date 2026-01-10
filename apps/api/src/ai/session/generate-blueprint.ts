import { CONFIG } from "../../lib/config";
import { requireOpenAi } from "../../lib/openai";
import { ApiError } from "../../middleware/error-handler";

import { buildSystemPrompt, buildUserPrompt } from "./prompts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * AI를 사용하여 세션 블루프린트 생성
 *
 * OpenAI Responses API 사용 (템플릿 기반 동적 스키마)
 */
export async function generateSessionBlueprintWithAi(input: {
  readonly sessionType: "LEARN";
  readonly planTitle: string;
  readonly moduleTitle: string;
  readonly sessionTitle: string;
  readonly objective: string | null;
  readonly estimatedMinutes: number;
  readonly template: unknown;
}): Promise<Record<string, unknown>> {
  const openai = requireOpenAi();

  const response = await openai.responses.create({
    model: CONFIG.OPENAI_CHAT_MODEL,
    instructions: buildSystemPrompt(),
    input: buildUserPrompt({
      sessionType: input.sessionType,
      planTitle: input.planTitle,
      moduleTitle: input.moduleTitle,
      sessionTitle: input.sessionTitle,
      objective: input.objective,
      estimatedMinutes: input.estimatedMinutes,
      template: input.template,
    }),
    text: {
      format: { type: "json_object" },
    },
  });

  // Responses API에서 output_text로 텍스트 응답 추출
  const content = response.output_text;
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
