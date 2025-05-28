import { z } from "@hono/zod-openapi";

export const PaginationQueryDto = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
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
});
