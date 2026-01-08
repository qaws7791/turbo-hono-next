import { z } from "@hono/zod-openapi";

import { PublicIdSchema } from "../../common/schema";

export const ConceptReviewStatusSchema = z.enum(["GOOD", "DUE", "OVERDUE"]);
export const ConceptReviewRatingSchema = z.enum([
  "AGAIN",
  "HARD",
  "GOOD",
  "EASY",
]);

export const ConceptLearningHistoryItemSchema = z.object({
  sessionRunId: PublicIdSchema,
  linkType: z.enum(["CREATED", "UPDATED", "REVIEWED"]),
  date: z.iso.datetime(),
  planId: PublicIdSchema,
  planTitle: z.string().min(1),
  moduleTitle: z.string().min(1).nullable(),
  sessionTitle: z.string().min(1),
});

export const ConceptListItemSchema = z.object({
  id: PublicIdSchema,
  title: z.string().min(1),
  oneLiner: z.string().min(1),
  tags: z.array(z.string()).default([]),
  reviewStatus: ConceptReviewStatusSchema,
  srsDueAt: z.iso.datetime().nullable(),
  lastLearnedAt: z.iso.datetime().nullable(),
  latestSource: ConceptLearningHistoryItemSchema.nullable(),
});

export const ConceptLibraryListItemSchema = ConceptListItemSchema.extend({
  spaceId: PublicIdSchema,
});

export const PaginationMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});

export const ConceptListResponseSchema = z.object({
  data: z.array(ConceptListItemSchema),
  meta: PaginationMetaSchema,
});

export const RelatedConceptSchema = z.object({
  id: PublicIdSchema,
  title: z.string().min(1),
  oneLiner: z.string().min(1),
  reviewStatus: ConceptReviewStatusSchema,
});

export const ConceptDetailResponseSchema = z.object({
  data: z.object({
    id: PublicIdSchema,
    spaceId: PublicIdSchema,
    title: z.string().min(1),
    oneLiner: z.string().min(1),
    ariNoteMd: z.string().min(1),
    tags: z.array(z.string()).default([]),
    reviewStatus: ConceptReviewStatusSchema,
    relatedConcepts: z.array(RelatedConceptSchema).default([]),
    learningHistory: z.array(ConceptLearningHistoryItemSchema).default([]),
    srsState: z
      .object({
        interval: z.number().int().nonnegative(),
        ease: z.number().min(1),
        dueAt: z.iso.datetime(),
      })
      .nullable(),
  }),
});

export const ConceptLibraryListResponseSchema = z.object({
  data: z.array(ConceptLibraryListItemSchema),
  meta: PaginationMetaSchema,
});

export const CreateConceptReviewRequestSchema = z.object({
  rating: ConceptReviewRatingSchema,
  sessionRunId: PublicIdSchema.optional(),
});

export const CreateConceptReviewResponseSchema = z.object({
  data: z.object({
    nextDueAt: z.iso.datetime(),
    newInterval: z.number().int().nonnegative(),
  }),
});

export const ConceptSearchResponseSchema = z.object({
  data: z.array(
    z.object({
      id: PublicIdSchema,
      spaceId: PublicIdSchema,
      title: z.string().min(1),
      oneLiner: z.string().min(1),
    }),
  ),
});
