import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import status from "http-status";
import { learningPlan } from "@repo/database/schema";
import { updateLearningPlanRoute } from "@repo/api-spec/modules/learning-plan/routes/update";

import { db } from "../../../database/client";
import { authMiddleware } from "../../../middleware/auth";
import { LearningPlanError } from "../errors";
import { LearningPlanEmoji } from "../utils/emoji";

import type { AuthContext } from "../../../middleware/auth";

type LearningPlanInsert = typeof learningPlan.$inferInsert;

const update = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...updateLearningPlanRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { learningPlanId: publicId } = c.req.valid("param");
      const updateData = c.req.valid("json");

      // Validate that at least one field is provided
      if (Object.keys(updateData).length === 0) {
        throw new LearningPlanError(
          400,
          "learning_plan:validation_failed",
          "At least one field must be provided for update",
        );
      }

      // Check if learningPlan exists and user has access
      const existingLearningPlans = await db
        .select({
          id: learningPlan.id,
          userId: learningPlan.userId,
          publicId: learningPlan.publicId,
          learningTopic: learningPlan.learningTopic,
          emoji: learningPlan.emoji,
        })
        .from(learningPlan)
        .where(eq(learningPlan.publicId, publicId))
        .limit(1);

      const [existingLearningPlan] = existingLearningPlans;

      if (!existingLearningPlan) {
        throw new LearningPlanError(
          404,
          "learning_plan:learning_plan_not_found",
          "Learning plan not found",
        );
      }

      if (existingLearningPlan.userId !== auth.user.id) {
        throw new LearningPlanError(
          403,
          "learning_plan:access_denied",
          "You don't have permission to update this learningPlan",
        );
      }

      // Perform the update
      const { emoji: requestedEmoji, ...restUpdate } =
        updateData as Partial<LearningPlanInsert>;

      const updatePayload: Partial<LearningPlanInsert> = {
        ...restUpdate,
        updatedAt: new Date(),
      };

      if (requestedEmoji !== undefined) {
        updatePayload.emoji = LearningPlanEmoji.ensure(
          requestedEmoji,
          (restUpdate.learningTopic as string | undefined) ??
            existingLearningPlan.learningTopic,
        );
      }

      const [updatedLearningPlan] = await db
        .update(learningPlan)
        .set({
          ...updatePayload,
        })
        .where(eq(learningPlan.publicId, publicId))
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

      if (!updatedLearningPlan) {
        throw new LearningPlanError(
          500,
          "learning_plan:update_failed",
          "Failed to update learningPlan",
        );
      }

      // Format response
      const formattedLearningPlan = {
        id: updatedLearningPlan.publicId,
        title: updatedLearningPlan.title,
        emoji: updatedLearningPlan.emoji,
        description: updatedLearningPlan.description,
        status: updatedLearningPlan.status as "active" | "archived",
        learningTopic: updatedLearningPlan.learningTopic,
        userLevel: updatedLearningPlan.userLevel,
        targetWeeks: updatedLearningPlan.targetWeeks,
        weeklyHours: updatedLearningPlan.weeklyHours,
        learningStyle: updatedLearningPlan.learningStyle,
        preferredResources: updatedLearningPlan.preferredResources,
        mainGoal: updatedLearningPlan.mainGoal,
        additionalRequirements: updatedLearningPlan.additionalRequirements,
        createdAt: updatedLearningPlan.createdAt.toISOString(),
        updatedAt: updatedLearningPlan.updatedAt.toISOString(),
      };

      return c.json(formattedLearningPlan, status.OK);
    } catch (error) {
      if (error instanceof LearningPlanError) {
        throw error;
      }

      console.error("Learning plan update error:", error);
      throw new LearningPlanError(
        500,
        "learning_plan:internal_error",
        "Failed to update learningPlan",
      );
    }
  },
);

export default update;
