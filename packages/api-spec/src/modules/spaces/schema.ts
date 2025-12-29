import { z } from "@hono/zod-openapi";

import { PublicIdSchema } from "../../common/schema";

export const SpaceSchema = z.object({
  id: PublicIdSchema,
  name: z.string().min(1),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const SpaceListResponseSchema = z.object({
  data: z.array(SpaceSchema),
});

export const CreateSpaceRequestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
});

export const CreateSpaceResponseSchema = z.object({
  data: SpaceSchema,
});

export const GetSpaceResponseSchema = z.object({
  data: SpaceSchema,
});

export const UpdateSpaceRequestSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(2000).optional(),
    icon: z.string().max(50).optional(),
    color: z.string().max(50).optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.description !== undefined ||
      value.icon !== undefined ||
      value.color !== undefined,
    "수정할 필드가 필요합니다.",
  );

export const UpdateSpaceResponseSchema = z.object({
  data: SpaceSchema,
});

export const DeleteSpaceResponseSchema = z.object({
  message: z.string().min(1),
});
