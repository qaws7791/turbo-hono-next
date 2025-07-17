import { z } from "zod";

const r2ConfigSchema = z.object({
  R2_BUCKET_NAME: z.string().min(1),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_ENDPOINT: z.string().min(1),
  R2_PUBLIC_URL: z.string().min(1),
});

const env = r2ConfigSchema.parse(process.env);

export const R2_CONFIG = {
  BUCKET_NAME: env.R2_BUCKET_NAME,
  ACCOUNT_ID: env.R2_ACCOUNT_ID,
  ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
  SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
  ENDPOINT: env.R2_ENDPOINT,
  PUBLIC_URL: env.R2_PUBLIC_URL,
  REGION: "auto",
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
};
