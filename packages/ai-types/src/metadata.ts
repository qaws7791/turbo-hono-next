import { z } from "zod";

/**
 * AI 채팅 메시지 메타데이터 스키마
 * 토큰 사용량, 모델 정보 등을 추적하기 위한 메타데이터
 */
export const messageMetadataSchema = z.object({
  timestamp: z.string(),
});

/**
 * Message Metadata 타입
 */
export type MessageMetadata = z.infer<typeof messageMetadataSchema>;
