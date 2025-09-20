import { z } from "zod";

const envSchema = z.object(
  {
    SERVICE_NAME: z.string().min(1).default("LOLOG"),
    SERVICE_DOMAIN: z.string().min(1),
    FRONTEND_URL: z.url(),
    BASE_URL: z.url().default("http://localhost:8787"),
    DATABASE_URL: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    MAGIC_LINK_EXPIRY_MINUTES: z.number().default(10),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    SESSION_COOKIE_NAME: z.string().default("session"),
    SESSION_DURATION_HOURS: z.number().default(24 * 7),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
  },
  {
    message: "Please provide all required environment variables",
  },
);

export const CONFIG = envSchema.parse(process.env);
