import { z } from "@hono/zod-openapi";

export const FeedsResponseDto = z
  .object({
    id: z.number(),
    title: z.string(),
    coverImageUrl: z.string().nullable(),
    author: z.object({
      id: z.number(),
      name: z.string(),
      profileImageUrl: z.string().nullable(),
    }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .array();
