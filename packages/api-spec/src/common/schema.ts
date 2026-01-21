import { z } from "@hono/zod-openapi";

export const PUBLIC_ID_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
export const PUBLIC_ID_LENGTH = 12;
export const PublicIdSchema = z
  .string()
  .regex(
    new RegExp(`^[${PUBLIC_ID_ALPHABET}]{${PUBLIC_ID_LENGTH}}$`),
    "Invalid public id",
  );

export const ValidationErrorSchema = z.object({
  field: z.string().min(1),
  code: z.string().min(1),
  message: z.string().min(1),
});

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    details: z.record(z.string(), z.unknown()).optional(),
    validation: z.array(ValidationErrorSchema).optional(),
  }),
});
