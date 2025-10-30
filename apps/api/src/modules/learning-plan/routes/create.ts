import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { nanoid } from "nanoid";
import { learningPlan } from "@repo/database/schema";
import { createLearningPlanRoute } from "@repo/api-spec/modules/learning-plan/routes/create";

import { db } from "../../../database/client";
import { authMiddleware } from "../../../middleware/auth";
import { LearningPlanError } from "../errors";
import { LearningPlanEmoji } from "../utils/emoji";

import type { AuthContext } from "../../../middleware/auth";

const create = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...createLearningPlanRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const body = c.req.valid("json");

      // Validate required fields
      const {
        title,
        emoji,
        description,
        learningTopic,
        userLevel,
        targetWeeks,
        weeklyHours,
        learningStyle,
        preferredResources,
        mainGoal,
        additionalRequirements,
      } = body;

      // Generate unique public ID
      const publicId = nanoid(16);
      const resolvedEmoji = LearningPlanEmoji.ensure(emoji, learningTopic);

      // Create learningPlan in database
      const [createdLearningPlan] = await db
        .insert(learningPlan)
        .values({
          publicId,
          userId: auth.user.id,
          title,
          description: description || null,
          status: "active",
          emoji: resolvedEmoji,
          learningTopic,
          userLevel,
          targetWeeks,
          weeklyHours,
          learningStyle,
          preferredResources,
          mainGoal,
          additionalRequirements: additionalRequirements || null,
        })
        .returning({
          id: learningPlan.id,
          publicId: learningPlan.publicId,
          title: learningPlan.title,
          description: learningPlan.description,
          status: learningPlan.status,
          emoji: learningPlan.emoji,
          learningTopic: learningPlan.learningTopic,
          userLevel: learningPlan.userLevel,
          targetWeeks: learningPlan.targetWeeks,
          weeklyHours: learningPlan.weeklyHours,
          learningStyle: learningPlan.learningStyle,
          preferredResources: learningPlan.preferredResources,
          mainGoal: learningPlan.mainGoal,
          additionalRequirements: learningPlan.additionalRequirements,
          createdAt: learningPlan.createdAt,
          updatedAt: learningPlan.updatedAt,
        });

      if (!createdLearningPlan) {
        throw new LearningPlanError(
          500,
          "learning_plan:creation_failed",
          "Failed to create learningPlan",
        );
      }

      // Format response
      return c.json(
        {
          id: createdLearningPlan.publicId,
          title: createdLearningPlan.title,
          emoji: createdLearningPlan.emoji,
          description: createdLearningPlan.description,
          status: createdLearningPlan.status as "active" | "archived",
          learningTopic: createdLearningPlan.learningTopic,
          userLevel: createdLearningPlan.userLevel,
          targetWeeks: createdLearningPlan.targetWeeks,
          weeklyHours: createdLearningPlan.weeklyHours,
          learningStyle: createdLearningPlan.learningStyle,
          preferredResources: createdLearningPlan.preferredResources,
          mainGoal: createdLearningPlan.mainGoal,
          additionalRequirements: createdLearningPlan.additionalRequirements,
          createdAt: createdLearningPlan.createdAt.toISOString(),
          updatedAt: createdLearningPlan.updatedAt.toISOString(),
        },
        status.CREATED,
      );
    } catch (error) {
      if (error instanceof LearningPlanError) {
        throw error;
      }

      // Handle validation errors
      if (error instanceof Error && error.message.includes("validation")) {
        throw new LearningPlanError(
          400,
          "learning_plan:validation_failed",
          "Invalid learningPlan data provided",
        );
      }

      console.error("Learning plan creation error:", error);
      throw new LearningPlanError(
        500,
        "learning_plan:internal_error",
        "Failed to create learningPlan",
      );
    }
  },
);

export default create;
