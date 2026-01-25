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

  COOKIE_SECURE: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  EMAIL_DELIVERY_MODE: z.enum(["resend", "log"]).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_EMAIL: z.email().optional(),

  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_BUCKET_NAME: z.string().min(1).optional(),
  R2_ENDPOINT: z.string().min(1).optional(),
  R2_PUBLIC_URL: z.string().min(1).optional(),

  AI_API_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_CHAT_MODEL: z.string().min(1).default("gemini-2.5-flash-lite"),
  GEMINI_EMBEDDING_MODEL: z.string().min(1).default("gemini-embedding-001"),
  AI_EMBEDDING_API_KEY: z.string().min(1).optional(),
  GEMINI_EMBEDDING_API_KEY: z.string().min(1).optional(),

  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_SESSION_MODEL: z.string().min(1).default("gpt-5-nano"),

  RATE_LIMIT_ENABLED: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

export type Config = ReturnType<typeof loadConfig>;

export function loadConfig(env: NodeJS.ProcessEnv): {
  readonly NODE_ENV: "development" | "test" | "production";
  readonly SERVICE_NAME: string;
  readonly PORT: number;
  readonly BASE_URL: string;
  readonly FRONTEND_URL: string;
  readonly DATABASE_URL?: string;
  readonly SESSION_COOKIE_NAME: string;
  readonly SESSION_COOKIE_NAME_FULL: string;
  readonly SESSION_DURATION_DAYS: number;
  readonly COOKIE_SECURE: boolean;
  readonly GOOGLE_CLIENT_ID?: string;
  readonly GOOGLE_CLIENT_SECRET?: string;
  readonly EMAIL_DELIVERY_MODE: "resend" | "log";
  readonly RESEND_API_KEY?: string;
  readonly RESEND_EMAIL?: string;
  readonly R2_ACCESS_KEY_ID?: string;
  readonly R2_SECRET_ACCESS_KEY?: string;
  readonly R2_BUCKET_NAME?: string;
  readonly R2_ENDPOINT?: string;
  readonly R2_PUBLIC_URL?: string;
  readonly AI_API_KEY?: string;
  readonly AI_EMBEDDING_API_KEY?: string;
  readonly GEMINI_API_KEY?: string;
  readonly GEMINI_CHAT_MODEL: string;
  readonly GEMINI_EMBEDDING_MODEL: string;
  readonly GEMINI_EMBEDDING_API_KEY?: string;
  readonly OPENAI_API_KEY?: string;
  readonly OPENAI_SESSION_MODEL: string;
  readonly RATE_LIMIT_ENABLED: boolean;
} {
  const parsed = envSchema.parse(env);

  const aiApiKey = parsed.AI_API_KEY ?? parsed.GEMINI_API_KEY;

  const aiEmbeddingApiKey =
    parsed.AI_EMBEDDING_API_KEY ?? parsed.GEMINI_EMBEDDING_API_KEY ?? aiApiKey;

  return {
    ...parsed,
    SESSION_COOKIE_NAME_FULL: `${(parsed.COOKIE_SECURE ?? parsed.NODE_ENV === "production") ? "__Secure-" : ""}${parsed.SESSION_COOKIE_NAME}`,
    AI_API_KEY: aiApiKey,
    AI_EMBEDDING_API_KEY: aiEmbeddingApiKey,
    COOKIE_SECURE: parsed.COOKIE_SECURE ?? parsed.NODE_ENV === "production",
    EMAIL_DELIVERY_MODE:
      parsed.EMAIL_DELIVERY_MODE ??
      (parsed.NODE_ENV === "production" ? "resend" : "log"),
    RATE_LIMIT_ENABLED: parsed.RATE_LIMIT_ENABLED ?? parsed.NODE_ENV !== "test",
  };
}

export const CONFIG = loadConfig(process.env);
