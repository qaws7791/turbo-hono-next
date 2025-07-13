import { z } from "zod";

const kakaoConfigSchema = z.object({
  KAKAO_CLIENT_ID: z.string().min(1),
  KAKAO_CLIENT_SECRET: z.string().min(1),
});

const env = kakaoConfigSchema.parse(process.env);

export const KAKAO_CONFIG = {
  KAKAO_CLIENT_ID: env.KAKAO_CLIENT_ID,
  KAKAO_CLIENT_SECRET: env.KAKAO_CLIENT_SECRET,
  KAKAO_AUTH_URL: "https://kauth.kakao.com/oauth/authorize",
  KAKAO_TOKEN_URL: "https://kauth.kakao.com/oauth/token",
  KAKAO_USER_INFO_URL: "https://kapi.kakao.com/v2/user/me",
};