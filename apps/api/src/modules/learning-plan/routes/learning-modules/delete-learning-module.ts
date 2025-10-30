import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { and, eq, gt, sql } from "drizzle-orm";
import { learningModule, learningPlan } from "@repo/database/schema";
import { deleteLearningModuleRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-modules/delete-learning-module";

import { db } from "../../../../database/client";
import { authMiddleware } from "../../../../middleware/auth";
import { LearningPlanError } from "../../errors";

import type { AuthContext } from "../../../../middleware/auth";

const deleteLearningModule = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...deleteLearningModuleRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { learningPlanId, learningModuleId } = c.req.valid("param");

      // Check if learningPlan exists and user owns it
      const [learningPlanResult] = await db
        .select({
          id: learningPlan.id,
          userId: learningPlan.userId,
        })
        .from(learningPlan)
        .where(eq(learningPlan.publicId, learningPlanId))
        .limit(1);

      if (!learningPlanResult) {
        throw new LearningPlanError(
          404,
          "learning_plan:learning_plan_not_found",
          "Learning plan not found",
        );
      }

      if (learningPlanResult.userId !== auth.user.id) {
        throw new LearningPlanError(
          403,
          "learning_plan:learning_module_access_denied",
          "You do not have permission to modify this learningPlan",
        );
      }

      // Check if learningModule exists and belongs to this learningPlan
      const [learningModuleResult] = await db
        .select({
          id: learningModule.id,
          publicId: learningModule.publicId,
          learningPlanId: learningModule.learningPlanId,
          order: learningModule.order,
        })
        .from(learningModule)
        .where(eq(learningModule.publicId, learningModuleId))
        .limit(1);

      if (!learningModuleResult) {
        throw new LearningPlanError(
          404,
          "learning_plan:learning_module_not_found",
          "Learning module not found",
        );
      }

      if (learningModuleResult.learningPlanId !== learningPlanResult.id) {
        throw new LearningPlanError(
          403,
          "learning_plan:learning_module_access_denied",
          "Learning module does not belong to this learningPlan",
        );
      }

      // Use transaction to delete learningModule and reorder remaining learningModules
      await db.transaction(async (tx) => {
        // Delete the learningModule (learningTasks will be deleted automatically due to cascade)
        await tx
          .delete(learningModule)
          .where(eq(learningModule.id, learningModuleResult.id));

        // Update order of learningModules that come after the deleted learningModule
        await tx
          .update(learningModule)
          .set({
            order: sql`${learningModule.order} - 1`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(learningModule.learningPlanId, learningPlanResult.id),
              gt(learningModule.order, learningModuleResult.order),
            ),
          );
      });

      // Return success response
      return c.json(
        {
          message: "Learning module deleted successfully",
          deletedId: learningModuleResult.publicId,
        },
        status.OK,
      );
    } catch (error) {
      if (error instanceof LearningPlanError) {
        throw error;
      }

      console.error("Learning module deletion error:", error);
      throw new LearningPlanError(
        500,
        "learning_plan:learning_module_deletion_failed",
        "Failed to delete learning module",
      );
    }
  },
);

export default deleteLearningModule;
