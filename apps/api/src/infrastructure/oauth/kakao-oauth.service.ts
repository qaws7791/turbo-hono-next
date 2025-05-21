import { env } from "@/common/config/env";
import { HTTPError } from "@/common/errors/http-error";
import {
  KakaoTokenResponse,
  KakaoTokenResponseSchema,
  KakaoUserInfoResponse,
  KakaoUserInfoResponseSchema,
} from "@/infrastructure/oauth/kakao-auth.schema";
import status from "http-status";
import { injectable } from "inversify";

@injectable()
export class KakaoOAuthService {
  private readonly KAKAO_CLIENT_ID = env.KAKAO_CLIENT_ID || "";
  private readonly KAKAO_CLIENT_SECRET = env.KAKAO_CLIENT_SECRET || "";
  private readonly KAKAO_REDIRECT_URI = env.KAKAO_REDIRECT_URI || "";
  private readonly KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize";
  private readonly KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
  private readonly KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";

  getKakaoLoginUrl(): string {
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
      throw new HTTPError(
        {
          message: `Failed to get tokens from Kakao: ${response.status} - ${JSON.stringify(errorBody)}`,
        },
        status.INTERNAL_SERVER_ERROR,
      );
    }

    const data = await response.json();
    try {
      return KakaoTokenResponseSchema.parse(data);
    } catch (error) {
      console.error("Kakao Token Response Validation Error:", error);
      throw new HTTPError(
        {
          message: "Invalid Kakao token response format.",
        },
        status.INTERNAL_SERVER_ERROR,
      );
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
      throw new HTTPError(
        {
          message: `Failed to get user info from Kakao: ${response.status} - ${JSON.stringify(errorBody)}`,
        },
        status.INTERNAL_SERVER_ERROR,
      );
    }

    const data = await response.json();
    try {
      return KakaoUserInfoResponseSchema.parse(data);
    } catch (error) {
      console.error("Kakao User Info Response Validation Error:", error);
      throw new HTTPError(
        {
          message: "Invalid Kakao user info response format.",
        },
        status.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
