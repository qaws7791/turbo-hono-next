import { z } from "@hono/zod-openapi";

export const ReactionBaseSchema = z.object({
  reactionType: z.enum(["like", "heart", "clap", "fire", "idea"]).nullable(),
});

export const ReactionCreateOrUpdateBodySchema = ReactionBaseSchema.pick({
  reactionType: true,
});
