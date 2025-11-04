/**
 * External AI Module
 *
 * 이 모듈은 외부 AI 서비스(Google Gemini)와의 통신을 담당합니다.
 * 모든 AI 호출 로직과 프롬프트 생성 로직이 이곳에 격리되어 있습니다.
 */

// Provider
export { geminiModel } from "./provider";

// Types
export type { AIGenerationResult, GenerationOptions } from "./types";

// Learning Plan
export {
  generateLearningPlan,
  type GenerateLearningPlanParams,
  type GeneratedLearningPlan,
} from "./features/learning-plan/generator";

export {
  generateLearningPlanPrompt,
  type LearningPlanPromptData,
} from "./features/learning-plan/prompt";

// Learning Task Note
export {
  generateLearningTaskNote,
  type GenerateLearningTaskNoteParams,
  type LearningTaskNoteContent,
  type DocumentFile,
} from "./features/learning-task-note/generator";

export {
  generateLearningTaskNotePrompt,
  type LearningTaskNotePromptInput,
  type LearningPlanSummaryInput,
  type FocusLearningModuleInput,
  type FocusLearningTaskInput,
  type LearningPlanLearningModuleSummary,
  type DocumentSummary,
} from "./features/learning-task-note/prompt";

// Learning Task Quiz
export {
  generateLearningTaskQuiz,
  type GenerateLearningTaskQuizParams,
  type LearningTaskQuizQuestion,
} from "./features/learning-task-quiz/generator";

export {
  generateLearningTaskQuizPrompt,
  type LearningTaskQuizPromptInput,
} from "./features/learning-task-quiz/prompt";
