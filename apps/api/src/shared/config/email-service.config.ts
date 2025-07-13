import { z } from "zod";

const emailServiceConfigSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  FRONTEND_URL: z.string().min(1),
  SERVICE_NAME: z.string().min(1),
  SERVICE_DOMAIN: z.string().min(1),
});

const env = emailServiceConfigSchema.parse(process.env);

export const EMAIL_SERVICE_CONFIG = {
  SERVICE_NAME: env.SERVICE_NAME,
  RESEND_API_KEY: env.RESEND_API_KEY,
  FRONTEND_URL: env.FRONTEND_URL,
  FROM_EMAIL: `${env.SERVICE_NAME} <no-reply@${env.SERVICE_DOMAIN}>`,
  MAGIC_LINK_EXPIRY_MINUTES: 10,
};
