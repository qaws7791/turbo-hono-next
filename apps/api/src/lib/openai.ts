import OpenAI from "openai";

import { ApiError } from "../middleware/error-handler";

import { CONFIG } from "./config";

import type { Config } from "./config";

export function createOpenAIClient(config: Config): OpenAI {
  const apiKey = config.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ApiError(
      503,
      "AI_UNAVAILABLE",
      "OpenAI 기능이 설정되지 않았습니다.",
    );
  }

  return new OpenAI({ apiKey });
}

const cachedOpenAIClientRef: { current: OpenAI | null } = { current: null };

export function getOpenAIClient(): OpenAI {
  if (cachedOpenAIClientRef.current) return cachedOpenAIClientRef.current;
  cachedOpenAIClientRef.current = createOpenAIClient(CONFIG);
  return cachedOpenAIClientRef.current;
}
