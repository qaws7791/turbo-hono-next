import { z } from "@hono/zod-openapi";

export const StoryCreateSchema = z.object({
  title: z.string().max(255),
  content: z.string(),
  coverImageUrl: z.string().nullable(),
});

export const StoryUpdateSchema = StoryCreateSchema.partial();

export const StoryIdParam = z.object({ id: z.coerce.number().positive() });

export const StoryBaseSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  contentText: z.string(),
  coverImageUrl: z.string().nullable(),
  authorId: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const StoryDetailResponseSchema = StoryBaseSchema.extend({
  author: z.object({
    id: z.number(),
    name: z.string(),
    profileImageUrl: z.string().nullable(),
  }),
  reactions: z.array(z.object({
    reactionType: z.enum(["like", "heart", "clap", "fire", "idea"]),
    count: z.number(),
  })),
});

export const StorySummaryResponseSchema = StoryDetailResponseSchema.omit({
  content: true,
  contentText: true,
});
