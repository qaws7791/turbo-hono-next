import { z } from "@hono/zod-openapi";

export const SidoListResponseDto = z
  .object({
    id: z.number(),
    name: z.string(),
  })
  .array();

export const SigunguListResponseDto = z
  .object({
    id: z.number(),
    name: z.string(),
    sidoId: z.number(),
  })
  .array();