import { z } from "zod";

const envSchema = z.object({
  SERVICE_NAME: z.string().min(1).default("Lolog"),
  FRONTEND_URL: z.string().min(1),
  BASE_URL: z.string().min(1).default("http://localhost:8787"),
});

const env = envSchema.parse(process.env);

export const APP_CONFIG = {
  SERVICE_NAME: env.SERVICE_NAME,
  FRONTEND_URL: env.FRONTEND_URL,
  BASE_URL: env.BASE_URL,
};
