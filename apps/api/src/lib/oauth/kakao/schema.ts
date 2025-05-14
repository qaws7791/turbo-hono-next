import { z } from "zod";
export const KakaoTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  refresh_token: z.string().optional(),
  expires_in: z.number(),
  refresh_token_expires_in: z.number().optional(),
  scope: z.string().optional(),
});
export type KakaoTokenResponse = z.infer<typeof KakaoTokenResponseSchema>;

export const KakaoUserInfoResponseSchema = z.object({
  id: z.number(),
  properties: z
    .object({
      nickname: z.string().optional(),
      profile_image: z.string().optional(),
      thumbnail_image: z.string().optional(),
    })
    .optional(),
  kakao_account: z
    .object({
      profile_needs_agreement: z.boolean().optional(),
      profile: z
        .object({
          nickname: z.string().optional(),
          thumbnail_image_url: z.string().optional(),
          profile_image_url: z.string().optional(),
          is_default_image: z.boolean().optional(),
        })
        .optional(),
      email_needs_agreement: z.boolean().optional(),
      is_email_valid: z.boolean().optional(),
      is_email_verified: z.boolean().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
});
export type KakaoUserInfoResponse = z.infer<typeof KakaoUserInfoResponseSchema>;
