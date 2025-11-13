import type {
  account,
  aiConversation,
  aiMessage,
  aiNote,
  aiQuiz,
  aiQuizResult,
  learningModule,
  learningPlan,
  learningPlanDocument,
  learningTask,
  session,
  user,
  verification,
} from "./schema";

/**
 * (Model), (Model)Insert, (Model)Update 총 3개의 타입을 정의합니다.
 */

export type User = typeof user.$inferSelect;
export type UserInsert = typeof user.$inferInsert;
export type UserUpdate = Partial<typeof user.$inferInsert>;

export type Session = typeof session.$inferSelect;
export type SessionInsert = typeof session.$inferInsert;
export type SessionUpdate = Partial<typeof session.$inferInsert>;

export type Account = typeof account.$inferSelect;
export type AccountInsert = typeof account.$inferInsert;
export type AccountUpdate = Partial<typeof account.$inferInsert>;

export type Verification = typeof verification.$inferSelect;
export type VerificationInsert = typeof verification.$inferInsert;
export type VerificationUpdate = Partial<typeof verification.$inferInsert>;

export type LearningPlan = typeof learningPlan.$inferSelect;
export type LearningPlanInsert = typeof learningPlan.$inferInsert;
export type LearningPlanUpdate = Partial<typeof learningPlan.$inferInsert>;

export type LearningModule = typeof learningModule.$inferSelect;
export type LearningModuleInsert = typeof learningModule.$inferInsert;
export type LearningModuleUpdate = Partial<typeof learningModule.$inferInsert>;

export type LearningTask = typeof learningTask.$inferSelect;
export type LearningTaskInsert = typeof learningTask.$inferInsert;
export type LearningTaskUpdate = Partial<typeof learningTask.$inferInsert>;

export type AiNote = typeof aiNote.$inferSelect;
export type AiNoteInsert = typeof aiNote.$inferInsert;
export type AiNoteUpdate = Partial<typeof aiNote.$inferInsert>;

export type AiQuiz = typeof aiQuiz.$inferSelect;
export type AiQuizInsert = typeof aiQuiz.$inferInsert;
export type AiQuizUpdate = Partial<typeof aiQuiz.$inferInsert>;

export type AiQuizResult = typeof aiQuizResult.$inferSelect;
export type AiQuizResultInsert = typeof aiQuizResult.$inferInsert;
export type AiQuizResultUpdate = Partial<typeof aiQuizResult.$inferInsert>;

export type LearningPlanDocument = typeof learningPlanDocument.$inferSelect;
export type LearningPlanDocumentInsert =
  typeof learningPlanDocument.$inferInsert;
export type LearningPlanDocumentUpdate = Partial<
  typeof learningPlanDocument.$inferInsert
>;

export type AIConversation = typeof aiConversation.$inferSelect;
export type NewAIConversation = typeof aiConversation.$inferInsert;
export type UpdateAIConversation = Partial<typeof aiConversation.$inferInsert>;

export type AIMessage = typeof aiMessage.$inferSelect;
export type NewAIMessage = typeof aiMessage.$inferInsert;
export type UpdateAIMessage = Partial<typeof aiMessage.$inferInsert>;
