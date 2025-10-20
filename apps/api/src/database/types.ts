import {
  account,
  aiNote,
  aiQuiz,
  aiQuizResult,
  goal,
  roadmap,
  roadmapDocument,
  session,
  subGoal,
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

export type Roadmap = typeof roadmap.$inferSelect;
export type RoadmapInsert = typeof roadmap.$inferInsert;
export type RoadmapUpdate = Partial<typeof roadmap.$inferInsert>;

export type Goal = typeof goal.$inferSelect;
export type GoalInsert = typeof goal.$inferInsert;
export type GoalUpdate = Partial<typeof goal.$inferInsert>;

export type SubGoal = typeof subGoal.$inferSelect;
export type SubGoalInsert = typeof subGoal.$inferInsert;
export type SubGoalUpdate = Partial<typeof subGoal.$inferInsert>;

export type AiNote = typeof aiNote.$inferSelect;
export type AiNoteInsert = typeof aiNote.$inferInsert;
export type AiNoteUpdate = Partial<typeof aiNote.$inferInsert>;

export type AiQuiz = typeof aiQuiz.$inferSelect;
export type AiQuizInsert = typeof aiQuiz.$inferInsert;
export type AiQuizUpdate = Partial<typeof aiQuiz.$inferInsert>;

export type AiQuizResult = typeof aiQuizResult.$inferSelect;
export type AiQuizResultInsert = typeof aiQuizResult.$inferInsert;
export type AiQuizResultUpdate = Partial<typeof aiQuizResult.$inferInsert>;

export type RoadmapDocument = typeof roadmapDocument.$inferSelect;
export type RoadmapDocumentInsert = typeof roadmapDocument.$inferInsert;
export type RoadmapDocumentUpdate = Partial<
  typeof roadmapDocument.$inferInsert
>;
