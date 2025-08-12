import { z } from "@hono/zod-openapi";

// Request schemas
export const CategoryIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const CategorySlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const CreateCategoryRequestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500).optional().nullable(),
  slug: z.string().min(1).max(100).optional(),
});

export const UpdateCategoryRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional().nullable(),
  slug: z.string().min(1).max(100).optional(),
});

// Response schemas
export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CategoryListResponseSchema = z.object({
  data: z.array(CategorySchema),
});

export const CategoryResponseSchema = z.object({
  data: CategorySchema,
});

// Error schemas
export const CategoryNotFoundErrorSchema = z.object({
  error: z.literal("Category not found"),
  code: z.literal("CATEGORY_NOT_FOUND"),
});

export const CategoryAlreadyExistsErrorSchema = z.object({
  error: z.literal("Category already exists"),
  code: z.literal("CATEGORY_ALREADY_EXISTS"),
});

export const CategorySlugAlreadyExistsErrorSchema = z.object({
  error: z.literal("Category slug already exists"),
  code: z.literal("CATEGORY_SLUG_ALREADY_EXISTS"),
});