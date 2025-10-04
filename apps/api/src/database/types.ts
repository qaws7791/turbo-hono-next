import {
  account,
  goal,
  roadmap,
  roadmapDocument,
  session,
  subGoal,
  user,
  verification,
} from "./schema";

export type User = typeof user.$inferSelect;
export type UserInsert = typeof user.$inferInsert;

export type Session = typeof session.$inferSelect;
export type SessionInsert = typeof session.$inferInsert;

export type Account = typeof account.$inferSelect;
export type AccountInsert = typeof account.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type VerificationInsert = typeof verification.$inferInsert;

export type Roadmap = typeof roadmap.$inferSelect;
export type RoadmapInsert = typeof roadmap.$inferInsert;

export type Goal = typeof goal.$inferSelect;
export type GoalInsert = typeof goal.$inferInsert;

export type SubGoal = typeof subGoal.$inferSelect;
export type SubGoalInsert = typeof subGoal.$inferInsert;

export type RoadmapDocument = typeof roadmapDocument.$inferSelect;
export type RoadmapDocumentInsert = typeof roadmapDocument.$inferInsert;
