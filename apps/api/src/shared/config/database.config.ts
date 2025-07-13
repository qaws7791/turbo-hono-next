import { z } from "zod";

const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

const env = databaseEnvSchema.parse(process.env);

export const DATABASE_CONFIG = {
  DATABASE_URL: env.DATABASE_URL,
};
