import { relations } from "drizzle-orm/relations";

import {
  authAccounts,
  authSessions,
  chatCitations,
  chatMessages,
  chatThreads,
  coachMessages,
  conceptRelations,
  conceptReviews,
  conceptSessionLinks,
  conceptTags,
  conceptTopicLinks,
  concepts,
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
  sessionConcepts,
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
  concepts: many(concepts),
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
  conceptRelations: many(conceptRelations),
  concepts: many(concepts),
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

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
  materialTags: many(materialTags),
  conceptTags: many(conceptTags),
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

export const outlineNodesRelations = relations(
  outlineNodes,
  ({ one, many }) => ({
    material: one(materials, {
      fields: [outlineNodes.materialId],
      references: [materials.id],
    }),
    space: one(spaces, {
      fields: [outlineNodes.spaceId],
      references: [spaces.id],
    }),
    conceptTopicLinks: many(conceptTopicLinks),
  }),
);

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
    sessionConcepts: many(sessionConcepts),
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
  conceptReviews: many(conceptReviews),
  sessionActivities: many(sessionActivities),
  conceptSessionLinks: many(conceptSessionLinks),
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

export const conceptReviewsRelations = relations(conceptReviews, ({ one }) => ({
  concept: one(concepts, {
    fields: [conceptReviews.conceptId],
    references: [concepts.id],
  }),
  sessionRun: one(sessionRuns, {
    fields: [conceptReviews.sessionRunId],
    references: [sessionRuns.id],
  }),
}));

export const conceptsRelations = relations(concepts, ({ one, many }) => ({
  conceptReviews: many(conceptReviews),
  conceptRelations_fromConceptId: many(conceptRelations, {
    relationName: "conceptRelations_fromConceptId_concepts_id",
  }),
  conceptRelations_toConceptId: many(conceptRelations, {
    relationName: "conceptRelations_toConceptId_concepts_id",
  }),
  user: one(users, {
    fields: [concepts.userId],
    references: [users.id],
  }),
  space: one(spaces, {
    fields: [concepts.spaceId],
    references: [spaces.id],
  }),
  conceptTopicLinks: many(conceptTopicLinks),
  conceptSessionLinks: many(conceptSessionLinks),
  conceptTags: many(conceptTags),
  sessionConcepts: many(sessionConcepts),
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

export const conceptRelationsRelations = relations(
  conceptRelations,
  ({ one }) => ({
    space: one(spaces, {
      fields: [conceptRelations.spaceId],
      references: [spaces.id],
    }),
    concept_fromConceptId: one(concepts, {
      fields: [conceptRelations.fromConceptId],
      references: [concepts.id],
      relationName: "conceptRelations_fromConceptId_concepts_id",
    }),
    concept_toConceptId: one(concepts, {
      fields: [conceptRelations.toConceptId],
      references: [concepts.id],
      relationName: "conceptRelations_toConceptId_concepts_id",
    }),
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

export const conceptTopicLinksRelations = relations(
  conceptTopicLinks,
  ({ one }) => ({
    concept: one(concepts, {
      fields: [conceptTopicLinks.conceptId],
      references: [concepts.id],
    }),
    outlineNode: one(outlineNodes, {
      fields: [conceptTopicLinks.outlineNodeId],
      references: [outlineNodes.id],
    }),
  }),
);

export const conceptSessionLinksRelations = relations(
  conceptSessionLinks,
  ({ one }) => ({
    concept: one(concepts, {
      fields: [conceptSessionLinks.conceptId],
      references: [concepts.id],
    }),
    sessionRun: one(sessionRuns, {
      fields: [conceptSessionLinks.sessionRunId],
      references: [sessionRuns.id],
    }),
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

export const conceptTagsRelations = relations(conceptTags, ({ one }) => ({
  concept: one(concepts, {
    fields: [conceptTags.conceptId],
    references: [concepts.id],
  }),
  tag: one(tags, {
    fields: [conceptTags.tagId],
    references: [tags.id],
  }),
}));

export const sessionConceptsRelations = relations(
  sessionConcepts,
  ({ one }) => ({
    planSession: one(planSessions, {
      fields: [sessionConcepts.sessionId],
      references: [planSessions.id],
    }),
    concept: one(concepts, {
      fields: [sessionConcepts.conceptId],
      references: [concepts.id],
    }),
  }),
);
