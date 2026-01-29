export type {
  AiConfig,
  AiModels,
  ChatModelPort,
  EmbeddingModelPort,
} from "./models";
export {
  ChatModel,
  DEFAULT_EMBEDDING_DIMENSIONS,
  EmbeddingModel,
  createAiModels,
} from "./models";

export type { AiError } from "./ai-error";
export { aiError, isAiError, toAiError } from "./ai-error";
