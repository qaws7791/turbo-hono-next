import { env } from "@/config/env";
import { z } from "@hono/zod-openapi";
import { injectable } from "inversify";

const KakaoTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  refresh_token: z.string().optional(),
  expires_in: z.number(),
  refresh_token_expires_in: z.number().optional(),
  scope: z.string().optional(),
});
type KakaoTokenResponse = z.infer<typeof KakaoTokenResponseSchema>;

const KakaoUserInfoResponseSchema = z.object({
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
type KakaoUserInfoResponse = z.infer<typeof KakaoUserInfoResponseSchema>;

@injectable()
export class KakaoAuthService {
  private readonly KAKAO_CLIENT_ID = env.KAKAO_CLIENT_ID || "";
  private readonly KAKAO_CLIENT_SECRET = env.KAKAO_CLIENT_SECRET || "";
  private readonly KAKAO_REDIRECT_URI = env.KAKAO_REDIRECT_URI || "";
  private readonly KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize";
  private readonly KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
  private readonly KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";

  constructor() {}

  getKakaoLoginUrl(): string {
    console.log(this.KAKAO_CLIENT_ID, this.KAKAO_REDIRECT_URI);
    const params = new URLSearchParams({
      client_id: this.KAKAO_CLIENT_ID,
      redirect_uri: this.KAKAO_REDIRECT_URI,
      response_type: "code",
      scope: "profile_nickname profile_image account_email",
    });
    return `${this.KAKAO_AUTH_URL}?${params.toString()}`;
  }

  async getTokensFromKakao(code: string): Promise<KakaoTokenResponse> {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.KAKAO_CLIENT_ID,
      redirect_uri: this.KAKAO_REDIRECT_URI,
      code: code,
      client_secret: this.KAKAO_CLIENT_SECRET,
    });

    const response = await fetch(this.KAKAO_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: params,
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Kakao Token Error:", errorBody);
      throw new Error(
        `Failed to get tokens from Kakao: ${response.status} - ${JSON.stringify(errorBody)}`,
      );
    }

    const data = await response.json();
    try {
      return KakaoTokenResponseSchema.parse(data);
    } catch (error) {
      console.error("Kakao Token Response Validation Error:", error);
      throw new Error("Invalid Kakao token response format.");
    }
  }

  async getUserInfoFromKakao(
    accessToken: string,
  ): Promise<KakaoUserInfoResponse> {
    const response = await fetch(this.KAKAO_USER_INFO_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Kakao User Info Error:", errorBody);
      throw new Error(
        `Failed to get user info from Kakao: ${response.status} - ${JSON.stringify(errorBody)}`,
      );
    }

    const data = await response.json();
    try {
      return KakaoUserInfoResponseSchema.parse(data);
    } catch (error) {
      console.error("Kakao User Info Response Validation Error:", error);
      throw new Error("Invalid Kakao user info response format.");
    }
  }
}
