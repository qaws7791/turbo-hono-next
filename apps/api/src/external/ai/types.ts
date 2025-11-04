/**
 * AI 생성 결과의 공통 타입
 */
export type AIGenerationResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * AI 생성 옵션 타입
 */
export type GenerationOptions = {
  temperature?: number;
  maxTokens?: number;
};

/**
 * 프롬프트 컨텍스트 타입
 */
export type PromptContext = {
  learningTopic?: string;
  userLevel?: string;
  additionalContext?: string;
};
