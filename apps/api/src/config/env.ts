import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  SESSION_COOKIE_NAME: z.string(),
  COOKIE_SECURE: z.string(),
  COOKIE_DOMAIN: z.string(),
  KAKAO_CLIENT_ID: z.string(),
  KAKAO_CLIENT_SECRET: z.string(),
  KAKAO_REDIRECT_URI: z.string().url(),
  PASSWORD_HASH_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
  FRONTEND_URL: z.string().url(),
  RESEND_EMAIL: z.string(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  COOKIE_SECURE: process.env.COOKIE_SECURE,
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID,
  KAKAO_CLIENT_SECRET: process.env.KAKAO_CLIENT_SECRET,
  KAKAO_REDIRECT_URI: process.env.KAKAO_REDIRECT_URI,
  PASSWORD_HASH_SECRET: process.env.PASSWORD_HASH_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  FRONTEND_URL: process.env.FRONTEND_URL,
  RESEND_EMAIL: process.env.RESEND_EMAIL,
});
