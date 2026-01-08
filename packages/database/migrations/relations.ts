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
  materialTags,
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
  sessionRuns,
  sessionSummaries,
  spaces,
  tags,
  users,
} from "./schema";

export const authSessionsRelations = relations(authSessions, ({ one }) => ({
  user: one(users, {
    fields: [authSessions.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  authSessions: many(authSessions),
  authAccounts: many(authAccounts),
  spaces: many(spaces),
  tags: many(tags),
  planGenerationRequests: many(planGenerationRequests),
  materials: many(materials),
  sessionRuns: many(sessionRuns),
  plans: many(plans),
  chatThreads: many(chatThreads),
  coachMessages: many(coachMessages),
  materialUploads: many(materialUploads),
}));

export const authAccountsRelations = relations(authAccounts, ({ one }) => ({
  user: one(users, {
    fields: [authAccounts.userId],
    references: [users.id],
  }),
}));

export const spacesRelations = relations(spaces, ({ one, many }) => ({
  user: one(users, {
    fields: [spaces.userId],
    references: [users.id],
  }),
  outlineNodes: many(outlineNodes),
  planGenerationRequests: many(planGenerationRequests),
  materials: many(materials),
  sessionRuns: many(sessionRuns),
  plans: many(plans),
  chatThreads: many(chatThreads),
  materialUploads: many(materialUploads),
}));

export const materialJobsRelations = relations(materialJobs, ({ one }) => ({
  material: one(materials, {
    fields: [materialJobs.materialId],
    references: [materials.id],
  }),
}));

export const materialsRelations = relations(materials, ({ one, many }) => ({
  materialJobs: many(materialJobs),
  materialChunks: many(materialChunks),
  outlineNodes: many(outlineNodes),
  user: one(users, {
    fields: [materials.userId],
    references: [users.id],
  }),
  space: one(spaces, {
    fields: [materials.spaceId],
    references: [spaces.id],
  }),
  materialUploads: many(materialUploads),
  planGenerationRequestMaterials: many(planGenerationRequestMaterials),
  materialTags: many(materialTags),
  planSourceMaterials: many(planSourceMaterials),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  materialTags: many(materialTags),
}));

export const materialChunksRelations = relations(
  materialChunks,
  ({ one, many }) => ({
    material: one(materials, {
      fields: [materialChunks.materialId],
      references: [materials.id],
    }),
    materialEmbeddings: many(materialEmbeddings),
    chatCitations: many(chatCitations),
  }),
);

export const outlineNodesRelations = relations(outlineNodes, ({ one }) => ({
  material: one(materials, {
    fields: [outlineNodes.materialId],
    references: [materials.id],
  }),
  space: one(spaces, {
    fields: [outlineNodes.spaceId],
    references: [spaces.id],
  }),
}));

export const planGenerationRequestsRelations = relations(
  planGenerationRequests,
  ({ one, many }) => ({
    user: one(users, {
      fields: [planGenerationRequests.userId],
      references: [users.id],
    }),
    space: one(spaces, {
      fields: [planGenerationRequests.spaceId],
      references: [spaces.id],
    }),
    plans: many(plans),
    planGenerationRequestMaterials: many(planGenerationRequestMaterials),
  }),
);

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

export const plansRelations = relations(plans, ({ one, many }) => ({
  planSessions: many(planSessions),
  sessionRuns: many(sessionRuns),
  user: one(users, {
    fields: [plans.userId],
    references: [users.id],
  }),
  space: one(spaces, {
    fields: [plans.spaceId],
    references: [spaces.id],
  }),
  planGenerationRequest: one(planGenerationRequests, {
    fields: [plans.generationRequestId],
    references: [planGenerationRequests.id],
  }),
  planModules: many(planModules),
  planSourceMaterials: many(planSourceMaterials),
}));

export const planModulesRelations = relations(planModules, ({ one, many }) => ({
  planSessions: many(planSessions),
  plan: one(plans, {
    fields: [planModules.planId],
    references: [plans.id],
  }),
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

export const sessionRunsRelations = relations(sessionRuns, ({ one, many }) => ({
  sessionCheckins: many(sessionCheckins),
  sessionProgressSnapshots: many(sessionProgressSnapshots),
  sessionSummaries: many(sessionSummaries),
  planSession: one(planSessions, {
    fields: [sessionRuns.sessionId],
    references: [planSessions.id],
  }),
  user: one(users, {
    fields: [sessionRuns.userId],
    references: [users.id],
  }),
  space: one(spaces, {
    fields: [sessionRuns.spaceId],
    references: [spaces.id],
  }),
  plan: one(plans, {
    fields: [sessionRuns.planId],
    references: [plans.id],
  }),
  sessionActivities: many(sessionActivities),
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

export const sessionSummariesRelations = relations(
  sessionSummaries,
  ({ one }) => ({
    sessionRun: one(sessionRuns, {
      fields: [sessionSummaries.sessionRunId],
      references: [sessionRuns.id],
    }),
  }),
);

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

export const chatThreadsRelations = relations(chatThreads, ({ one, many }) => ({
  chatMessages: many(chatMessages),
  user: one(users, {
    fields: [chatThreads.userId],
    references: [users.id],
  }),
  space: one(spaces, {
    fields: [chatThreads.spaceId],
    references: [spaces.id],
  }),
}));

export const materialEmbeddingsRelations = relations(
  materialEmbeddings,
  ({ one }) => ({
    materialChunk: one(materialChunks, {
      fields: [materialEmbeddings.chunkId],
      references: [materialChunks.id],
    }),
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

export const coachMessagesRelations = relations(coachMessages, ({ one }) => ({
  user: one(users, {
    fields: [coachMessages.userId],
    references: [users.id],
  }),
}));

export const materialUploadsRelations = relations(
  materialUploads,
  ({ one }) => ({
    user: one(users, {
      fields: [materialUploads.userId],
      references: [users.id],
    }),
    space: one(spaces, {
      fields: [materialUploads.spaceId],
      references: [spaces.id],
    }),
    material: one(materials, {
      fields: [materialUploads.materialId],
      references: [materials.id],
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
    material: one(materials, {
      fields: [planGenerationRequestMaterials.materialId],
      references: [materials.id],
    }),
    planGenerationRequest: one(planGenerationRequests, {
      fields: [planGenerationRequestMaterials.requestId],
      references: [planGenerationRequests.id],
    }),
  }),
);

export const materialTagsRelations = relations(materialTags, ({ one }) => ({
  material: one(materials, {
    fields: [materialTags.materialId],
    references: [materials.id],
  }),
  tag: one(tags, {
    fields: [materialTags.tagId],
    references: [tags.id],
  }),
}));

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
