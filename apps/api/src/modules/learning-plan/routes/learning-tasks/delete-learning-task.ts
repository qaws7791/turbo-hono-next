import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { eq, gt, sql } from "drizzle-orm";
import {
  learningModule,
  learningPlan,
  learningTask,
} from "@repo/database/schema";
import { deleteLearningTaskRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/delete-learning-task";

import { db } from "../../../../database/client";
import { authMiddleware } from "../../../../middleware/auth";
import { LearningPlanError } from "../../errors";

import type { AuthContext } from "../../../../middleware/auth";

const deleteLearningTask = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...deleteLearningTaskRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { learningPlanId, learningModuleId, learningTaskId } =
        c.req.valid("param");

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
          "learning_plan:access_denied",
          "You do not have permission to modify this learningPlan",
        );
      }

      // Check if learningModule exists and belongs to this learningPlan
      const [learningModuleResult] = await db
        .select({
          id: learningModule.id,
          learningPlanId: learningModule.learningPlanId,
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
          404,
          "learning_plan:learning_module_not_found",
          "Learning module does not belong to this learningPlan",
        );
      }

      // Check if learning-task exists and belongs to this learningModule
      const [learningTaskResult] = await db
        .select({
          id: learningTask.id,
          publicId: learningTask.publicId,
          learningModuleId: learningTask.learningModuleId,
          order: learningTask.order,
        })
        .from(learningTask)
        .where(eq(learningTask.publicId, learningTaskId))
        .limit(1);

      if (!learningTaskResult) {
        throw new LearningPlanError(
          404,
          "learning_plan:learning_task_not_found",
          "Learning-task not found",
        );
      }

      if (learningTaskResult.learningModuleId !== learningModuleResult.id) {
        throw new LearningPlanError(
          404,
          "learning_plan:learning_task_not_found",
          "Learning-task does not belong to this learning module",
        );
      }

      // Perform deletion and reorder in a transaction
      await db.transaction(async (tx) => {
        // Delete the learning-task
        await tx
          .delete(learningTask)
          .where(eq(learningTask.id, learningTaskResult.id));

        // Reorder remaining learning-tasks to close gaps
        // Decrease order by 1 for all learning-tasks with order greater than deleted one
        await tx
          .update(learningTask)
          .set({
            order: sql`${learningTask.order} - 1`,
            updatedAt: new Date(),
          })
          .where(
            eq(learningTask.learningModuleId, learningModuleResult.id) &&
              gt(learningTask.order, learningTaskResult.order),
          );
      });

      // Format response
      return c.json(
        {
          message: "Learning-task deleted successfully",
          deletedId: learningTaskResult.publicId,
        },
        status.OK,
      );
    } catch (error) {
      if (error instanceof LearningPlanError) {
        throw error;
      }

      console.error("Learning-task deletion error:", error);
      throw new LearningPlanError(
        500,
        "learning_plan:internal_error",
        "Failed to delete learning-task",
      );
    }
  },
);

export default deleteLearningTask;
