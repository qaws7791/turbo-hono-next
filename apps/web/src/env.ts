import { z } from "zod";

const DEFAULT_API_BASE_URL = "http://localhost:3999";

/**
 * Validates and exposes the runtime environment variables consumed by the
 * frontend bundles.
 */
const clientEnvSchema = z.object({
  VITE_API_BASE_URL: z.url().trim().default(DEFAULT_API_BASE_URL),
  DEV: z.boolean(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

const clientEnv = clientEnvSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  DEV: import.meta.env.DEV,
});

export const API_BASE_URL = clientEnv.VITE_API_BASE_URL;
export const isDevelopment = clientEnv.DEV;
export const env = clientEnv;
