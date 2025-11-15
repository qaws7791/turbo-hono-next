/**
 * @repo/ai-types
 * AI SDK v5 공유 타입 패키지
 *
 * 백엔드와 프론트엔드 간 타입 안전성을 보장하기 위한 공통 타입 정의
 */

// Message types
export type {
  AppUIMessage,
  StoredMessage,
  Message,
  MessageRole,
  Conversation,
} from "./message";
export { storedMessageSchema, conversationSchema } from "./message";

// Tool types - Stored Tool Invocation
export type { StoredToolInvocation } from "./tools";
export { storedToolInvocationSchema } from "./tools";

// Tool types - Input Schemas
export {
  // Learning Module Tools
  createModuleInputSchema,
  updateModuleInputSchema,
  deleteModuleInputSchema,
  listModulesInputSchema,
  // Learning Task Tools
  createTaskInputSchema,
  updateTaskInputSchema,
  deleteTaskInputSchema,
  completeTasksInputSchema,
  listTasksInputSchema,
  bulkUpdateTasksInputSchema,
  // Query Info Tools
  getProgressInputSchema,
  getPlanDetailsInputSchema,
  getModuleDetailsInputSchema,
} from "./tools";

// Tool types - Input Types
export type {
  // Learning Module Tools
  CreateModuleInput,
  UpdateModuleInput,
  DeleteModuleInput,
  ListModulesInput,
  // Learning Task Tools
  CreateTaskInput,
  UpdateTaskInput,
  DeleteTaskInput,
  CompleteTasksInput,
  ListTasksInput,
  BulkUpdateTasksInput,
  // Query Info Tools
  GetProgressInput,
  GetPlanDetailsInput,
  GetModuleDetailsInput,
} from "./tools";

// Tool types - Output Schemas
export {
  // Learning Module Tools
  createModuleOutputSchema,
  updateModuleOutputSchema,
  deleteModuleOutputSchema,
  listModulesOutputSchema,
  // Learning Task Tools
  createTaskOutputSchema,
  updateTaskOutputSchema,
  deleteTaskOutputSchema,
  completeTasksOutputSchema,
  listTasksOutputSchema,
  bulkUpdateTasksOutputSchema,
  // Query Info Tools
  getProgressOutputSchema,
  getPlanDetailsOutputSchema,
  getModuleDetailsOutputSchema,
} from "./tools";

// Tool types - Output Types
export type {
  // Learning Module Tools
  CreateModuleOutput,
  UpdateModuleOutput,
  DeleteModuleOutput,
  ListModulesOutput,
  // Learning Task Tools
  CreateTaskOutput,
  UpdateTaskOutput,
  DeleteTaskOutput,
  CompleteTasksOutput,
  ListTasksOutput,
  BulkUpdateTasksOutput,
  // Query Info Tools
  GetProgressOutput,
  GetPlanDetailsOutput,
  GetModuleDetailsOutput,
} from "./tools";

// Tool types - All Tools Type
export type { AllTools } from "./tools";

// Metadata types
export type { MessageMetadata } from "./metadata";
export { messageMetadataSchema } from "./metadata";

// Data parts types
export type { DataParts, UIDataTypes } from "./data-parts";
export {
  dataPartsSchema,
  toolExecutionStatusDataSchema,
  planUpdateNotificationDataSchema,
  aiResponseProgressDataSchema,
  // Legacy schemas (하위 호환성)
  learningProgressDataSchema,
  notificationDataSchema,
} from "./data-parts";
