import { z } from "zod";

const sessionConfigSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  SERVICE_DOMAIN: z.string().min(1),
});

const env = sessionConfigSchema.parse(process.env);

export const SESSION_CONFIG = {
  COOKIE_NAME: "session",
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: "/",
    domain: env.SERVICE_DOMAIN,
  },
  SESSION_DURATION_HOURS: 24 * 7, // 7 days
} as const;
