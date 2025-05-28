import { z } from "@hono/zod-openapi";

export const EmailRegisterBodyDto = z.object({
  email: z.string(),
  password: z.string(),
  name: z.string(),
});

export const EmailLoginBodyDto = z.object({
  email: z.string(),
  password: z.string(),
});

export const EmailVerifyBodyDto = z.object({
  token: z.string(),
});

export const SessionResponseDto = z.object({
  userId: z.number(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
});

export const SocialLoginBodyDto = z.object({
  token: z.string(),
});
