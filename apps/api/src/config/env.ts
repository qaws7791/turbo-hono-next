import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  SESSION_COOKIE_NAME: z.string(),
  COOKIE_SECURE: z.string(),
  COOKIE_DOMAIN: z.string(),
  KAKAO_CLIENT_ID: z.string(),
  KAKAO_CLIENT_SECRET: z.string(),
  KAKAO_REDIRECT_URI: z.string(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  COOKIE_SECURE: process.env.COOKIE_SECURE,
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID,
  KAKAO_CLIENT_SECRET: process.env.KAKAO_CLIENT_SECRET,
  KAKAO_REDIRECT_URI: process.env.KAKAO_REDIRECT_URI,
});
