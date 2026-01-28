import { z } from "zod";

export const RequestMagicLinkInput = z.object({
  email: z.string().email(),
  redirectPath: z.string().min(1),
});
export type RequestMagicLinkInput = z.infer<typeof RequestMagicLinkInput>;

export const VerifyMagicLinkInput = z.object({
  token: z.string().min(1),
});
export type VerifyMagicLinkInput = z.infer<typeof VerifyMagicLinkInput>;

export const VerifyGoogleOAuthInput = z.object({
  code: z.string().min(1),
  codeVerifier: z.string().min(1),
});
export type VerifyGoogleOAuthInput = z.infer<typeof VerifyGoogleOAuthInput>;
