import { z } from "@hono/zod-openapi";

export const PaginationQueryDto = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const CursorPaginationQueryDto = z.object({
  cursor: z.string().nullable().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const EntityIdParamDto = z.object({
  id: z.coerce.number().int().positive(), // Assuming IDs are numeric
});

export const ErrorResponseDto = z.object({
  status: z.number(),
  success: z.boolean(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
export const SuccessResponseDto = z.object({
  status: z.number(),
  success: z.boolean(),
  data: z.any(),
  pagination: z
    .object({
      currentPage: z.number().optional(),
      itemCount: z.number(),
      itemsPerPage: z.number(),
      totalItems: z.number().optional(),
      totalPages: z.number().optional(),
      hasNextPage: z.boolean().optional(),
      hasPrevPage: z.boolean().optional(),
      nextCursor: z.string().nullable().optional(),
      prevCursor: z.string().nullable().optional(),
    })
    .optional(),
});
