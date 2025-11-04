import { google } from "@ai-sdk/google";

/**
 * Google Gemini AI 모델 인스턴스
 * 모든 AI 생성 작업에 사용됨
 */
export const geminiModel = google("gemini-2.5-flash-lite");
