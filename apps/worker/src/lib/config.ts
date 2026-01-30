import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  SERVICE_NAME: z.string().min(1).default("LOLOG-WORKER"),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  QUEUE_CONCURRENCY: z.coerce.number().int().min(1).max(100).default(2),

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

  WORKERS: z.string().min(1).optional(),
});

export type Config = ReturnType<typeof loadConfig>;

export function loadConfig(env: NodeJS.ProcessEnv): {
  readonly NODE_ENV: "development" | "test" | "production";
  readonly SERVICE_NAME: string;
  readonly DATABASE_URL: string;
  readonly REDIS_URL: string;
  readonly QUEUE_CONCURRENCY: number;
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
  readonly WORKERS?: string;
} {
  const parsed = envSchema.parse(env);

  const aiApiKey = parsed.AI_API_KEY ?? parsed.GEMINI_API_KEY;

  const aiEmbeddingApiKey =
    parsed.AI_EMBEDDING_API_KEY ?? parsed.GEMINI_EMBEDDING_API_KEY ?? aiApiKey;

  return {
    ...parsed,
    AI_API_KEY: aiApiKey,
    AI_EMBEDDING_API_KEY: aiEmbeddingApiKey,
  };
}

export const CONFIG = loadConfig(process.env);
