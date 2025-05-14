import { env } from "@/config/env";
import { HTTPError } from "@/errors/http-error";
import {
  KakaoTokenResponse,
  KakaoTokenResponseSchema,
  KakaoUserInfoResponse,
  KakaoUserInfoResponseSchema,
} from "@/lib/oauth/kakao/schema";
import status from "http-status";

const KAKAO_CLIENT_ID = env.KAKAO_CLIENT_ID || "";
const KAKAO_CLIENT_SECRET = env.KAKAO_CLIENT_SECRET || "";
const KAKAO_REDIRECT_URI = env.KAKAO_REDIRECT_URI || "";
const KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize";
const KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
const KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";

function getKakaoLoginUrl(): string {
  const params = new URLSearchParams({
    client_id: KAKAO_CLIENT_ID,
    redirect_uri: KAKAO_REDIRECT_URI,
    response_type: "code",
    scope: "profile_nickname profile_image account_email",
  });
  return `${KAKAO_AUTH_URL}?${params.toString()}`;
}

async function getTokensFromKakao(code: string): Promise<KakaoTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: KAKAO_CLIENT_ID,
    redirect_uri: KAKAO_REDIRECT_URI,
    code: code,
    client_secret: KAKAO_CLIENT_SECRET,
  });

  const response = await fetch(KAKAO_TOKEN_URL, {
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

async function getUserInfoFromKakao(
  accessToken: string,
): Promise<KakaoUserInfoResponse> {
  const response = await fetch(KAKAO_USER_INFO_URL, {
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

const kakaoOAuth = {
  getKakaoLoginUrl,
  getTokensFromKakao,
  getUserInfoFromKakao,
};

export default kakaoOAuth;
