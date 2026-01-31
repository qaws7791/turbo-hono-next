import { z } from "zod";

export const SubscriptionPlanSchema = z.enum(["FREE", "PRO"]);

export const AuthUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  displayName: z.string().min(1),
  avatarUrl: z.url().nullable(),
  locale: z.string().min(1),
  timezone: z.string().min(1),
  subscriptionPlan: SubscriptionPlanSchema,
});

export const MagicLinkRequestSchema = z.object({
  email: z.email(),
  redirectPath: z.string().min(1),
});

export const MagicLinkRequestResponseSchema = z.object({
  message: z.string().min(1),
});

export const AuthMeResponseSchema = z.object({
  data: AuthUserSchema,
});

export const AuthLogoutResponseSchema = z.object({
  message: z.string().min(1),
});
