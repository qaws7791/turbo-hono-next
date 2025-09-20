import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { account, session, user, verification } from "../../database/schema";

// Request/Response Schemas
const EmailSignupRequestSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(100).optional(),
  password: z.string(),
});

const EmailLoginRequestSchema = z.object({
  email: z.email(),
  password: z.string(),
});

const VerifyMagicLinkRequestSchema = z.object({
  token: z.string(),
});

const ResetPasswordRequestSchema = z.object({
  email: z.email(),
  password: z.string(),
});

const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
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
  email: z.string(),
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

// Database Schemas
const UserSchema = createSelectSchema(user);
const InsertUserSchema = createInsertSchema(user);

const SessionSchema = createSelectSchema(session);
const InsertSessionSchema = createInsertSchema(session);

const AccountSchema = createSelectSchema(account);
const InsertAccountSchema = createInsertSchema(account);

const VerificationSchema = createSelectSchema(verification);
const InsertVerificationSchema = createInsertSchema(verification);

// Types
type EmailSignupRequest = z.infer<typeof EmailSignupRequestSchema>;
type EmailLoginRequest = z.infer<typeof EmailLoginRequestSchema>;
type VerifyMagicLinkRequest = z.infer<typeof VerifyMagicLinkRequestSchema>;
type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
type GitHubCallbackRequest = z.infer<typeof GitHubCallbackRequestSchema>;
type User = z.infer<typeof UserSchema>;
type Session = z.infer<typeof SessionSchema>;
type Account = z.infer<typeof AccountSchema>;
type Verification = z.infer<typeof VerificationSchema>;

export const AuthModel = {
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

export type {
  Account,
  EmailLoginRequest,
  EmailSignupRequest,
  GitHubCallbackRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  Session,
  User,
  Verification,
  VerifyMagicLinkRequest,
};
