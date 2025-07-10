import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

const env = envSchema.parse(process.env);

export const DATABASE_CONFIG = {
  DATABASE_URL: env.DATABASE_URL,
};
