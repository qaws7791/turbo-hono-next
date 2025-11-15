import { z } from "zod";

/**
 * ============================================================
 * Custom Data Parts for Streaming
 * AI SDK v5의 data stream parts로 전송되는 일시적 데이터
 * ============================================================
 */

/**
 * Tool 실행 상태 데이터 (스트리밍 중 실시간 피드백)
 */
export const toolExecutionStatusDataSchema = z.object({
  toolName: z.string().describe("실행 중인 tool 이름"),
  status: z
    .enum(["pending", "running", "completed", "error"])
    .describe("실행 상태"),
  message: z.string().optional().describe("상태 메시지"),
  progress: z.number().min(0).max(100).optional().describe("진행률 (0-100)"),
});

/**
 * 학습 계획 변경 알림 데이터
 */
export const planUpdateNotificationDataSchema = z.object({
  type: z.enum([
    "module_added",
    "module_updated",
    "module_deleted",
    "task_added",
    "task_updated",
    "task_deleted",
    "task_completed",
  ]),
  entityId: z.string().describe("변경된 엔티티 ID (모듈 또는 태스크)"),
  entityType: z.enum(["module", "task"]),
  message: z.string().describe("변경 내용 설명"),
});

/**
 * AI 응답 진행 상태 데이터
 */
export const aiResponseProgressDataSchema = z.object({
  step: z.string().describe("현재 진행 단계 설명"),
  stepNumber: z.number().int().min(1).describe("단계 번호"),
  totalSteps: z.number().int().min(1).describe("전체 단계 수"),
});

/**
 * 커스텀 데이터 파트 스키마 (저장용)
 */
export const dataPartsSchema = z.object({
  toolExecutionStatus: toolExecutionStatusDataSchema.optional(),
  planUpdateNotification: planUpdateNotificationDataSchema.optional(),
  aiResponseProgress: aiResponseProgressDataSchema.optional(),
});

/**
 * Data Parts 타입
 */
export type DataParts = z.infer<typeof dataPartsSchema>;

// Legacy schemas (하위 호환성 유지)
export const learningProgressDataSchema = toolExecutionStatusDataSchema;
export const notificationDataSchema = planUpdateNotificationDataSchema;

/**
 * ============================================================
 * AI SDK v5 UIDataTypes
 * streamText()의 제네릭 타입 파라미터로 사용
 * ============================================================
 */

/**
 * AI SDK v5 UIDataTypes 형식
 * 스트리밍 중 data stream parts로 전송되는 커스텀 데이터 타입
 *
 * 사용 예:
 * ```ts
 * streamText<MessageMetadata, UIDataTypes>({
 *   model: geminiModel,
 *   messages,
 *   onChunk: ({ chunk }) => {
 *     if (chunk.type === 'tool-execution-status') {
 *       // toolExecutionStatus 데이터 처리
 *     }
 *   }
 * })
 * ```
 */

export const uiDataTypesSchema = z.object({
  toolExecutionStatus: toolExecutionStatusDataSchema.optional(),
  planUpdateNotification: planUpdateNotificationDataSchema.optional(),
  aiResponseProgress: aiResponseProgressDataSchema.optional(),
});

export type UIDataTypes = {
  /** Tool 실행 상태 업데이트 */
  toolExecutionStatus: {
    toolName: string;
    status: "pending" | "running" | "completed" | "error";
    message?: string;
    progress?: number;
  };
  /** 학습 계획 변경 알림 */
  planUpdateNotification: {
    type:
      | "module_added"
      | "module_updated"
      | "module_deleted"
      | "task_added"
      | "task_updated"
      | "task_deleted"
      | "task_completed";
    entityId: string;
    entityType: "module" | "task";
    message: string;
  };
  /** AI 응답 진행 상태 */
  aiResponseProgress: {
    step: string;
    stepNumber: number;
    totalSteps: number;
  };
};
