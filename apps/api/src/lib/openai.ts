import OpenAI from "openai";

import { ApiError } from "../middleware/error-handler";

import { CONFIG } from "./config";

export const openai = CONFIG.OPENAI_API_KEY
  ? new OpenAI({ apiKey: CONFIG.OPENAI_API_KEY })
  : null;

export function requireOpenAi(): OpenAI {
  if (!openai) {
    throw new ApiError(
      503,
      "AI_SERVICE_UNAVAILABLE",
      "AI 서비스가 설정되지 않았습니다.",
    );
  }
  return openai;
}
