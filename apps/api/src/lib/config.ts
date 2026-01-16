import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  SERVICE_NAME: z.string().min(1).default("LOLOG"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),

  BASE_URL: z.url().default("http://localhost:3001"),
  FRONTEND_URL: z.url().default("http://localhost:3000"),

  DATABASE_URL: z.string().min(1).optional(),

  SESSION_COOKIE_NAME: z.string().min(1).default("session"),
  SESSION_DURATION_DAYS: z.coerce.number().int().min(1).max(30).default(7),

  COOKIE_DOMAIN: z.string().min(1).optional(),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  EMAIL_DELIVERY_MODE: z.enum(["resend", "log"]).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_EMAIL: z.email().optional(),

  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_ENDPOINT: z.string().min(1),
  R2_PUBLIC_URL: z.string().min(1),

  GOOGLE_API_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_CHAT_MODEL: z.string().min(1).default("gemini-2.5-flash-lite"),
  GEMINI_EMBEDDING_MODEL: z.string().min(1).default("gemini-embedding-001"),
  GEMINI_EMBEDDING_API_KEY: z.string().min(1),
});

const parsed = envSchema.parse(process.env);

export const CONFIG = {
  ...parsed,
  AI_API_KEY: parsed.GEMINI_API_KEY ?? parsed.GOOGLE_API_KEY,
  COOKIE_SECURE: parsed.COOKIE_SECURE ?? parsed.NODE_ENV === "production",
  EMAIL_DELIVERY_MODE:
    parsed.EMAIL_DELIVERY_MODE ??
    (parsed.NODE_ENV === "production" ? "resend" : "log"),
};
