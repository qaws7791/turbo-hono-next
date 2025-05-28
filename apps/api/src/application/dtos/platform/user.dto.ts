import { z } from "@hono/zod-openapi";

export const MyUserResponseDto = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.string().datetime().nullable(),
  profileImageUrl: z.string().nullable(),
  role: z.enum(["user", "creator"]),
  status: z.enum(["active", "inactive", "suspended"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const UpdateUserProfileBodyDto = z.object({
  name: z.string().optional(),
  profileImageUrl: z.string().optional(),
});
