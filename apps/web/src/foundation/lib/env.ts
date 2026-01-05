import { z } from "zod";

const ViteEnvSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .min(1, "VITE_API_BASE_URL is required")
    .transform((value) => (value.endsWith("/") ? value.slice(0, -1) : value)),
  VITE_MSW: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((value) => value === "true"),
  DEV: z.boolean(),
});

export const env = (() => {
  const parsed = ViteEnvSchema.parse({
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_MSW: import.meta.env.VITE_MSW,
    DEV: import.meta.env.DEV,
  });

  const frozen = Object.freeze({ ...parsed } as const);
  return frozen;
})();
