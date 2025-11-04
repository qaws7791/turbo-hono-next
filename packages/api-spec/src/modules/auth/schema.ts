import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "@hono/zod-openapi";
import { account, session, user, verification } from "@repo/database/schema";

const EmailSignupRequestSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
  password: z.string(),
});

const EmailLoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const VerifyMagicLinkRequestSchema = z.object({
  token: z.string(),
});

const ResetPasswordRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string(),
  newPassword: z
    .string()
    .min(6, "비밀번호는 최소 6자 이상이어야 합니다.")
    .openapi({
      description: "새로운 비밀번호",
      example: "new-secure-password",
    }),
});

const GitHubCallbackRequestSchema = z.object({
  code: z.string(),
  state: z.string().optional(),
});

const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
});

const SessionResponseSchema = z.object({
  user: UserResponseSchema,
  session: z.object({
    id: z.string(),
    expiresAt: z.string(),
  }),
});

const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
});

const UserSchema = createSelectSchema(user);
const InsertUserSchema = createInsertSchema(user);

const SessionSchema = createSelectSchema(session);
const InsertSessionSchema = createInsertSchema(session);

const AccountSchema = createSelectSchema(account);
const InsertAccountSchema = createInsertSchema(account);

const VerificationSchema = createSelectSchema(verification);
const InsertVerificationSchema = createInsertSchema(verification);

export const AuthSchemas = {
  EmailSignupRequestSchema,
  EmailLoginRequestSchema,
  VerifyMagicLinkRequestSchema,
  ResetPasswordRequestSchema,
  ChangePasswordRequestSchema,
  GitHubCallbackRequestSchema,
  SuccessResponseSchema,
  UserResponseSchema,
  SessionResponseSchema,
  ErrorResponseSchema,
  UserSchema,
  InsertUserSchema,
  SessionSchema,
  InsertSessionSchema,
  AccountSchema,
  InsertAccountSchema,
  VerificationSchema,
  InsertVerificationSchema,
};

export const AuthModel = AuthSchemas;

export type EmailSignupRequest = z.infer<typeof EmailSignupRequestSchema>;
export type EmailLoginRequest = z.infer<typeof EmailLoginRequestSchema>;
export type VerifyMagicLinkRequest = z.infer<
  typeof VerifyMagicLinkRequestSchema
>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
export type GitHubCallbackRequest = z.infer<typeof GitHubCallbackRequestSchema>;
export type User = z.infer<typeof UserSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type Account = z.infer<typeof AccountSchema>;
export type Verification = z.infer<typeof VerificationSchema>;
