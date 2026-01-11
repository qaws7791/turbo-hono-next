import { relations } from "drizzle-orm/relations";

import {
  authAccounts,
  authSessions,
  chatCitations,
  chatMessages,
  chatThreads,
  coachMessages,
  materialChunks,
  materialEmbeddings,
  materialJobs,
  materialUploads,
  materials,
  outlineNodes,
  planGenerationRequestMaterials,
  planGenerationRequests,
  planModules,
  planSessions,
  planSourceMaterials,
  plans,
  ragCollections,
  ragDocuments,
  sessionActivities,
  sessionCheckins,
  sessionProgressSnapshots,
  sessionRunBlueprints,
  sessionRuns,
  sessionSummaries,
  users,
} from "./schema";

export const chatThreadsRelations = relations(chatThreads, ({ one, many }) => ({
  user: one(users, {
    fields: [chatThreads.userId],
    references: [users.id],
  }),
  chatMessages: many(chatMessages),
}));

export const usersRelations = relations(users, ({ many }) => ({
  chatThreads: many(chatThreads),
  coachMessages: many(coachMessages),
  authAccounts: many(authAccounts),
  authSessions: many(authSessions),
  materialUploads: many(materialUploads),
  planGenerationRequests: many(planGenerationRequests),
  materials: many(materials),
  plans: many(plans),
  sessionRuns: many(sessionRuns),
}));

export const planModulesRelations = relations(planModules, ({ one, many }) => ({
  plan: one(plans, {
    fields: [planModules.planId],
    references: [plans.id],
  }),
  planSessions: many(planSessions),
}));

export const plansRelations = relations(plans, ({ one, many }) => ({
  planModules: many(planModules),
  planSessions: many(planSessions),
  user: one(users, {
    fields: [plans.userId],
    references: [users.id],
  }),
  planGenerationRequest: one(planGenerationRequests, {
    fields: [plans.generationRequestId],
    references: [planGenerationRequests.id],
  }),
  sessionRuns: many(sessionRuns),
  planSourceMaterials: many(planSourceMaterials),
}));

export const planSessionsRelations = relations(
  planSessions,
  ({ one, many }) => ({
    plan: one(plans, {
      fields: [planSessions.planId],
      references: [plans.id],
    }),
    planModule: one(planModules, {
      fields: [planSessions.moduleId],
      references: [planModules.id],
    }),
    sessionRuns: many(sessionRuns),
  }),
);

export const coachMessagesRelations = relations(coachMessages, ({ one }) => ({
  user: one(users, {
    fields: [coachMessages.userId],
    references: [users.id],
  }),
}));

export const authAccountsRelations = relations(authAccounts, ({ one }) => ({
  user: one(users, {
    fields: [authAccounts.userId],
    references: [users.id],
  }),
}));

export const authSessionsRelations = relations(authSessions, ({ one }) => ({
  user: one(users, {
    fields: [authSessions.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(
  chatMessages,
  ({ one, many }) => ({
    chatThread: one(chatThreads, {
      fields: [chatMessages.threadId],
      references: [chatThreads.id],
    }),
    chatCitations: many(chatCitations),
  }),
);

export const materialEmbeddingsRelations = relations(
  materialEmbeddings,
  ({ one }) => ({
    materialChunk: one(materialChunks, {
      fields: [materialEmbeddings.chunkId],
      references: [materialChunks.id],
    }),
  }),
);

export const materialChunksRelations = relations(
  materialChunks,
  ({ one, many }) => ({
    materialEmbeddings: many(materialEmbeddings),
    material: one(materials, {
      fields: [materialChunks.materialId],
      references: [materials.id],
    }),
    chatCitations: many(chatCitations),
  }),
);

export const materialJobsRelations = relations(materialJobs, ({ one }) => ({
  material: one(materials, {
    fields: [materialJobs.materialId],
    references: [materials.id],
  }),
}));

export const materialsRelations = relations(materials, ({ one, many }) => ({
  materialJobs: many(materialJobs),
  materialChunks: many(materialChunks),
  materialUploads: many(materialUploads),
  user: one(users, {
    fields: [materials.userId],
    references: [users.id],
  }),
  outlineNodes: many(outlineNodes),
  planGenerationRequestMaterials: many(planGenerationRequestMaterials),
  planSourceMaterials: many(planSourceMaterials),
}));

export const materialUploadsRelations = relations(
  materialUploads,
  ({ one }) => ({
    user: one(users, {
      fields: [materialUploads.userId],
      references: [users.id],
    }),
    material: one(materials, {
      fields: [materialUploads.materialId],
      references: [materials.id],
    }),
  }),
);

export const planGenerationRequestsRelations = relations(
  planGenerationRequests,
  ({ one, many }) => ({
    user: one(users, {
      fields: [planGenerationRequests.userId],
      references: [users.id],
    }),
    plans: many(plans),
    planGenerationRequestMaterials: many(planGenerationRequestMaterials),
  }),
);

export const sessionActivitiesRelations = relations(
  sessionActivities,
  ({ one }) => ({
    sessionRun: one(sessionRuns, {
      fields: [sessionActivities.sessionRunId],
      references: [sessionRuns.id],
    }),
  }),
);

export const sessionRunsRelations = relations(sessionRuns, ({ one, many }) => ({
  sessionActivities: many(sessionActivities),
  sessionCheckins: many(sessionCheckins),
  planSession: one(planSessions, {
    fields: [sessionRuns.sessionId],
    references: [planSessions.id],
  }),
  user: one(users, {
    fields: [sessionRuns.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [sessionRuns.planId],
    references: [plans.id],
  }),
  sessionProgressSnapshots: many(sessionProgressSnapshots),
  sessionRunBlueprints: many(sessionRunBlueprints),
  sessionSummaries: many(sessionSummaries),
}));

export const sessionCheckinsRelations = relations(
  sessionCheckins,
  ({ one }) => ({
    sessionRun: one(sessionRuns, {
      fields: [sessionCheckins.sessionRunId],
      references: [sessionRuns.id],
    }),
  }),
);

export const outlineNodesRelations = relations(outlineNodes, ({ one }) => ({
  material: one(materials, {
    fields: [outlineNodes.materialId],
    references: [materials.id],
  }),
}));

export const chatCitationsRelations = relations(chatCitations, ({ one }) => ({
  chatMessage: one(chatMessages, {
    fields: [chatCitations.messageId],
    references: [chatMessages.id],
  }),
  materialChunk: one(materialChunks, {
    fields: [chatCitations.chunkId],
    references: [materialChunks.id],
  }),
}));

export const sessionProgressSnapshotsRelations = relations(
  sessionProgressSnapshots,
  ({ one }) => ({
    sessionRun: one(sessionRuns, {
      fields: [sessionProgressSnapshots.sessionRunId],
      references: [sessionRuns.id],
    }),
  }),
);

export const sessionRunBlueprintsRelations = relations(
  sessionRunBlueprints,
  ({ one }) => ({
    sessionRun: one(sessionRuns, {
      fields: [sessionRunBlueprints.sessionRunId],
      references: [sessionRuns.id],
    }),
  }),
);

export const sessionSummariesRelations = relations(
  sessionSummaries,
  ({ one }) => ({
    sessionRun: one(sessionRuns, {
      fields: [sessionSummaries.sessionRunId],
      references: [sessionRuns.id],
    }),
  }),
);

export const ragDocumentsRelations = relations(ragDocuments, ({ one }) => ({
  ragCollection: one(ragCollections, {
    fields: [ragDocuments.collectionId],
    references: [ragCollections.uuid],
  }),
}));

export const ragCollectionsRelations = relations(
  ragCollections,
  ({ many }) => ({
    ragDocuments: many(ragDocuments),
  }),
);

export const planGenerationRequestMaterialsRelations = relations(
  planGenerationRequestMaterials,
  ({ one }) => ({
    planGenerationRequest: one(planGenerationRequests, {
      fields: [planGenerationRequestMaterials.requestId],
      references: [planGenerationRequests.id],
    }),
    material: one(materials, {
      fields: [planGenerationRequestMaterials.materialId],
      references: [materials.id],
    }),
  }),
);

export const planSourceMaterialsRelations = relations(
  planSourceMaterials,
  ({ one }) => ({
    plan: one(plans, {
      fields: [planSourceMaterials.planId],
      references: [plans.id],
    }),
    material: one(materials, {
      fields: [planSourceMaterials.materialId],
      references: [materials.id],
    }),
  }),
);
