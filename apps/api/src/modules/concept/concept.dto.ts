import { z } from "zod";

import { PaginationInput, PaginationMeta } from "../../lib/pagination";
import { isPublicId } from "../../lib/public-id";

const PublicIdSchema = z.string().refine(isPublicId, "Invalid public id");

export const ConceptReviewStatusSchema = z.enum(["GOOD", "DUE", "OVERDUE"]);
export type ConceptReviewStatus = z.infer<typeof ConceptReviewStatusSchema>;

export const ConceptReviewRatingSchema = z.enum([
  "AGAIN",
  "HARD",
  "GOOD",
  "EASY",
]);
export type ConceptReviewRating = z.infer<typeof ConceptReviewRatingSchema>;

export const ListConceptsInput = PaginationInput.extend({
  spaceId: PublicIdSchema,
  search: z.string().max(200).optional(),
  reviewStatus: ConceptReviewStatusSchema.optional(),
});
export type ListConceptsInput = z.infer<typeof ListConceptsInput>;

const ConceptLearningHistoryItem = z.object({
  sessionRunId: PublicIdSchema,
  linkType: z.enum(["CREATED", "UPDATED", "REVIEWED"]),
  date: z.string().datetime(),
  planId: PublicIdSchema,
  planTitle: z.string().min(1),
  moduleTitle: z.string().min(1).nullable(),
  sessionTitle: z.string().min(1),
});

export const ConceptListItem = z.object({
  id: PublicIdSchema,
  title: z.string().min(1),
  oneLiner: z.string().min(1),
  tags: z.array(z.string()).default([]),
  reviewStatus: ConceptReviewStatusSchema,
  srsDueAt: z.string().datetime().nullable(),
  lastLearnedAt: z.string().datetime().nullable(),
  latestSource: ConceptLearningHistoryItem.nullable(),
});
export type ConceptListItem = z.infer<typeof ConceptListItem>;

export const ListConceptsResponse = z.object({
  data: z.array(ConceptListItem),
  meta: PaginationMeta,
});
export type ListConceptsResponse = z.infer<typeof ListConceptsResponse>;

export const ConceptDetailResponse = z.object({
  data: z.object({
    id: PublicIdSchema,
    spaceId: PublicIdSchema,
    title: z.string().min(1),
    oneLiner: z.string().min(1),
    ariNoteMd: z.string().min(1),
    tags: z.array(z.string()).default([]),
    reviewStatus: ConceptReviewStatusSchema,
    relatedConcepts: z
      .array(
        z.object({
          id: PublicIdSchema,
          title: z.string().min(1),
          oneLiner: z.string().min(1),
          reviewStatus: ConceptReviewStatusSchema,
        }),
      )
      .default([]),
    learningHistory: z.array(ConceptLearningHistoryItem).default([]),
    srsState: z
      .object({
        interval: z.number().int().nonnegative(),
        ease: z.number().min(1),
        dueAt: z.string().datetime(),
      })
      .nullable(),
  }),
});
export type ConceptDetailResponse = z.infer<typeof ConceptDetailResponse>;

export const CreateConceptReviewInput = z.object({
  rating: ConceptReviewRatingSchema,
  sessionRunId: PublicIdSchema.optional(),
});
export type CreateConceptReviewInput = z.infer<typeof CreateConceptReviewInput>;

export const CreateConceptReviewResponse = z.object({
  data: z.object({
    nextDueAt: z.string().datetime(),
    newInterval: z.number().int().nonnegative(),
  }),
});
export type CreateConceptReviewResponse = z.infer<
  typeof CreateConceptReviewResponse
>;

export const SearchConceptsInput = z.object({
  q: z.string().min(1).max(200),
  spaceIds: z.array(PublicIdSchema).optional(),
});
export type SearchConceptsInput = z.infer<typeof SearchConceptsInput>;

export const SearchConceptsResponse = z.object({
  data: z.array(
    z.object({
      id: PublicIdSchema,
      spaceId: PublicIdSchema,
      title: z.string().min(1),
      oneLiner: z.string().min(1),
    }),
  ),
});
export type SearchConceptsResponse = z.infer<typeof SearchConceptsResponse>;

export const ListConceptLibraryInput = PaginationInput.extend({
  search: z.string().max(200).optional(),
  reviewStatus: ConceptReviewStatusSchema.optional(),
  spaceIds: z.array(PublicIdSchema).min(1).max(50).optional(),
});
export type ListConceptLibraryInput = z.infer<typeof ListConceptLibraryInput>;

export const ConceptLibraryListItem = z.object({
  id: PublicIdSchema,
  spaceId: PublicIdSchema,
  title: z.string().min(1),
  oneLiner: z.string().min(1),
  tags: z.array(z.string()).default([]),
  reviewStatus: ConceptReviewStatusSchema,
  srsDueAt: z.string().datetime().nullable(),
  lastLearnedAt: z.string().datetime().nullable(),
  latestSource: ConceptLearningHistoryItem.nullable(),
});
export type ConceptLibraryListItem = z.infer<typeof ConceptLibraryListItem>;

export const ListConceptLibraryResponse = z.object({
  data: z.array(ConceptLibraryListItem),
  meta: PaginationMeta,
});
export type ListConceptLibraryResponse = z.infer<
  typeof ListConceptLibraryResponse
>;
