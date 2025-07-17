import { z } from "@hono/zod-openapi";

export const PresignedUploadUrlRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().positive(),
});

export const PresignedUploadUrlResponseSchema = z.object({
  presignedUrl: z.string(),
  objectKey: z.string(),
  publicFileUrl: z.string(),
});

export const errorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
});
