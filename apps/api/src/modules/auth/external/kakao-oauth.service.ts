import { injectable } from "inversify";
import { KAKAO_CONFIG } from "../../../shared/config/kakao.config";

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
}

interface KakaoUserInfo {
  id: number;
  connected_at: string;
  properties: {
    nickname: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account: {
    profile_nickname_needs_agreement: boolean;
    profile_image_needs_agreement: boolean;
    profile: {
      nickname: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
      is_default_image: boolean;
    };
    has_email: boolean;
    email_needs_agreement: boolean;
    is_email_valid: boolean;
    is_email_verified: boolean;
    email?: string;
  };
}

@injectable()
export class KakaoService {
  private readonly clientId = KAKAO_CONFIG.KAKAO_CLIENT_ID;
  private readonly clientSecret = KAKAO_CONFIG.KAKAO_CLIENT_SECRET;

  async getAccessToken(code: string, redirectUri: string): Promise<string> {
    const response = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get Kakao access token");
    }

    const data = (await response.json()) as KakaoTokenResponse;
    return data.access_token;
  }

  async getUserInfo(accessToken: string): Promise<{
    id: string;
    email: string;
    name: string;
    profileImage?: string;
  }> {
    const response = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get Kakao user info");
    }

    const data = (await response.json()) as KakaoUserInfo;

    if (!data.kakao_account.email) {
      throw new Error("Email is required for registration");
    }

    return {
      id: data.id.toString(),
      email: data.kakao_account.email,
      name: data.kakao_account.profile.nickname,
      profileImage: data.kakao_account.profile.profile_image_url,
    };
  }
}
