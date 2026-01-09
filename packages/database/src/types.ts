import type {
  authAccounts,
  authSessions,
  chatCitations,
  chatMessages,
  chatThreads,
  coachMessages,
  domainEvents,
  magicLinkTokens,
  materialChunks,
  materialEmbeddings,
  materialJobs,
  materials,
  outlineNodes,
  planGenerationRequestMaterials,
  planGenerationRequests,
  planModules,
  planSessions,
  planSourceMaterials,
  plans,
  sessionActivities,
  sessionCheckins,
  sessionProgressSnapshots,
  sessionRuns,
  sessionSummaries,
  users,
} from "./schema";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type AuthAccount = typeof authAccounts.$inferSelect;
export type NewAuthAccount = typeof authAccounts.$inferInsert;

export type MagicLinkToken = typeof magicLinkTokens.$inferSelect;
export type NewMagicLinkToken = typeof magicLinkTokens.$inferInsert;

export type AuthSession = typeof authSessions.$inferSelect;
export type NewAuthSession = typeof authSessions.$inferInsert;

export type Material = typeof materials.$inferSelect;
export type NewMaterial = typeof materials.$inferInsert;

export type MaterialJob = typeof materialJobs.$inferSelect;
export type NewMaterialJob = typeof materialJobs.$inferInsert;

export type MaterialChunk = typeof materialChunks.$inferSelect;
export type NewMaterialChunk = typeof materialChunks.$inferInsert;

export type MaterialEmbedding = typeof materialEmbeddings.$inferSelect;
export type NewMaterialEmbedding = typeof materialEmbeddings.$inferInsert;

export type OutlineNode = typeof outlineNodes.$inferSelect;
export type NewOutlineNode = typeof outlineNodes.$inferInsert;

export type PlanGenerationRequest = typeof planGenerationRequests.$inferSelect;
export type NewPlanGenerationRequest =
  typeof planGenerationRequests.$inferInsert;

export type PlanGenerationRequestMaterial =
  typeof planGenerationRequestMaterials.$inferSelect;
export type NewPlanGenerationRequestMaterial =
  typeof planGenerationRequestMaterials.$inferInsert;

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;

export type PlanSourceMaterial = typeof planSourceMaterials.$inferSelect;
export type NewPlanSourceMaterial = typeof planSourceMaterials.$inferInsert;

export type PlanModule = typeof planModules.$inferSelect;
export type NewPlanModule = typeof planModules.$inferInsert;

export type PlanSession = typeof planSessions.$inferSelect;
export type NewPlanSession = typeof planSessions.$inferInsert;

export type SessionRun = typeof sessionRuns.$inferSelect;
export type NewSessionRun = typeof sessionRuns.$inferInsert;

export type SessionProgressSnapshot =
  typeof sessionProgressSnapshots.$inferSelect;
export type NewSessionProgressSnapshot =
  typeof sessionProgressSnapshots.$inferInsert;

export type SessionCheckin = typeof sessionCheckins.$inferSelect;
export type NewSessionCheckin = typeof sessionCheckins.$inferInsert;

export type SessionActivity = typeof sessionActivities.$inferSelect;
export type NewSessionActivity = typeof sessionActivities.$inferInsert;

export type SessionSummary = typeof sessionSummaries.$inferSelect;
export type NewSessionSummary = typeof sessionSummaries.$inferInsert;

export type ChatThread = typeof chatThreads.$inferSelect;
export type NewChatThread = typeof chatThreads.$inferInsert;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;

export type ChatCitation = typeof chatCitations.$inferSelect;
export type NewChatCitation = typeof chatCitations.$inferInsert;

export type CoachMessage = typeof coachMessages.$inferSelect;
export type NewCoachMessage = typeof coachMessages.$inferInsert;

export type DomainEvent = typeof domainEvents.$inferSelect;
export type NewDomainEvent = typeof domainEvents.$inferInsert;
