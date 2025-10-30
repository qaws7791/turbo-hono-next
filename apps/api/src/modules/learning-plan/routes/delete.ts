import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import status from "http-status";
import { learningPlan } from "@repo/database/schema";
import { deleteLearningPlanRoute } from "@repo/api-spec/modules/learning-plan/routes/delete";

import { db } from "../../../database/client";
import { authMiddleware } from "../../../middleware/auth";
import { LearningPlanError } from "../errors";

import type { AuthContext } from "../../../middleware/auth";

const deleteLearningPlan = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...deleteLearningPlanRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { learningPlanId: publicId } = c.req.valid("param");

      // Check if learningPlan exists and user has access
      const existingLearningPlans = await db
        .select({
          id: learningPlan.id,
          userId: learningPlan.userId,
          publicId: learningPlan.publicId,
          status: learningPlan.status,
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
          "You don't have permission to delete this learningPlan",
        );
      }

      // Perform the deletion (CASCADE will handle learningModules and learningTasks)
      const deletedLearningPlans = await db
        .delete(learningPlan)
        .where(eq(learningPlan.publicId, publicId))
        .returning({
          publicId: learningPlan.publicId,
        });

      if (deletedLearningPlans.length === 0) {
        throw new LearningPlanError(
          500,
          "learning_plan:deletion_failed",
          "Failed to delete learningPlan",
        );
      }

      return c.json(
        {
          message: "Learning plan deleted successfully",
          deletedId: publicId,
        },
        status.OK,
      );
    } catch (error) {
      if (error instanceof LearningPlanError) {
        throw error;
      }

      console.error("Learning plan deletion error:", error);
      throw new LearningPlanError(
        500,
        "learning_plan:internal_error",
        "Failed to delete learningPlan",
      );
    }
  },
);

export default deleteLearningPlan;
