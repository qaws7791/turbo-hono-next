import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import status from "http-status";
import { learningPlan } from "@repo/database/schema";
import { learningPlanStatusRoute } from "@repo/api-spec/modules/learning-plan/routes/status";

import { db } from "../../../database/client";
import { authMiddleware } from "../../../middleware/auth";
import { LearningPlanError } from "../errors";

import type { AuthContext } from "../../../middleware/auth";

const changeStatus = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...learningPlanStatusRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { learningPlanId: publicId } = c.req.valid("param");
      const { status: newStatus } = c.req.valid("json");

      // Check if learningPlan exists and user has access
      const existingLearningPlan = await db
        .select({
          id: learningPlan.id,
          userId: learningPlan.userId,
          publicId: learningPlan.publicId,
          status: learningPlan.status,
        })
        .from(learningPlan)
        .where(eq(learningPlan.publicId, publicId))
        .limit(1);

      const [learningPlanRow] = existingLearningPlan;

      if (!learningPlanRow) {
        throw new LearningPlanError(
          404,
          "learning_plan:learning_plan_not_found",
          "Learning plan not found",
        );
      }

      if (learningPlanRow.userId !== auth.user.id) {
        throw new LearningPlanError(
          403,
          "learning_plan:access_denied",
          "You don't have permission to change this learningPlan's status",
        );
      }

      // Check if status is already the requested status
      if (learningPlanRow.status === newStatus) {
        throw new LearningPlanError(
          409,
          "learning_plan:learning_plan_already_archived",
          `LearningPlan is already ${newStatus}`,
        );
      }

      // Perform the status update
      const [updatedLearningPlan] = await db
        .update(learningPlan)
        .set({
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(learningPlan.publicId, publicId))
        .returning({
          publicId: learningPlan.publicId,
          status: learningPlan.status,
          emoji: learningPlan.emoji,
          updatedAt: learningPlan.updatedAt,
        });

      if (!updatedLearningPlan) {
        throw new LearningPlanError(
          500,
          "learning_plan:status_change_failed",
          "Failed to change learningPlan status",
        );
      }

      return c.json(
        {
          id: updatedLearningPlan.publicId,
          status: updatedLearningPlan.status as "active" | "archived",
          emoji: updatedLearningPlan.emoji,
          updatedAt: updatedLearningPlan.updatedAt.toISOString(),
        },
        status.OK,
      );
    } catch (error) {
      if (error instanceof LearningPlanError) {
        throw error;
      }

      console.error("Learning plan status change error:", error);
      throw new LearningPlanError(
        500,
        "learning_plan:internal_error",
        "Failed to change learningPlan status",
      );
    }
  },
);

export default changeStatus;
