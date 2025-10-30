import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { eq, gte, lte, max, sql } from "drizzle-orm";
import {
  learningModule,
  learningPlan,
  learningTask,
} from "@repo/database/schema";
import { moveLearningTaskRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/move-learning-task";

import { db } from "../../../../database/client";
import { authMiddleware } from "../../../../middleware/auth";
import { LearningPlanError } from "../../errors";

import type { AuthContext } from "../../../../middleware/auth";

const moveLearningTask = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...moveLearningTaskRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { learningPlanId, learningModuleId, learningTaskId } =
        c.req.valid("param");
      const { newLearningModuleId, newOrder } = c.req.valid("json");

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

      // Check if current learningModule exists and belongs to this learningPlan
      const [currentLearningModuleResult] = await db
        .select({
          id: learningModule.id,
          publicId: learningModule.publicId,
          learningPlanId: learningModule.learningPlanId,
        })
        .from(learningModule)
        .where(eq(learningModule.publicId, learningModuleId))
        .limit(1);

      if (!currentLearningModuleResult) {
        throw new LearningPlanError(
          404,
          "learning_plan:learning_module_not_found",
          "Current learningModule not found",
        );
      }

      if (
        currentLearningModuleResult.learningPlanId !== learningPlanResult.id
      ) {
        throw new LearningPlanError(
          404,
          "learning_plan:learning_module_not_found",
          "Current learningModule does not belong to this learningPlan",
        );
      }

      // Check if target learningModule exists and belongs to this learningPlan
      const [targetLearningModuleResult] = await db
        .select({
          id: learningModule.id,
          publicId: learningModule.publicId,
          learningPlanId: learningModule.learningPlanId,
        })
        .from(learningModule)
        .where(eq(learningModule.publicId, newLearningModuleId))
        .limit(1);

      if (!targetLearningModuleResult) {
        throw new LearningPlanError(
          404,
          "learning_plan:target_learning_module_not_found",
          "Target learningModule not found",
        );
      }

      if (targetLearningModuleResult.learningPlanId !== learningPlanResult.id) {
        throw new LearningPlanError(
          404,
          "learning_plan:target_learning_module_not_found",
          "Target learningModule does not belong to this learningPlan",
        );
      }

      // Check if learning-task exists and belongs to current learningModule
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

      if (
        learningTaskResult.learningModuleId !== currentLearningModuleResult.id
      ) {
        throw new LearningPlanError(
          404,
          "learning_plan:learning_task_not_found",
          "Learning-task does not belong to the current learning module",
        );
      }

      // Perform the move operation in a transaction
      await db.transaction(async (tx) => {
        const isSameLearningModule =
          currentLearningModuleResult.id === targetLearningModuleResult.id;

        if (isSameLearningModule) {
          // Moving within the same learningModule - reorder
          if (newOrder !== undefined) {
            const currentOrder = learningTaskResult.order;
            const targetOrder = newOrder;

            if (currentOrder !== targetOrder) {
              if (currentOrder < targetOrder) {
                // Moving down: decrease order of items between current and target
                await tx
                  .update(learningTask)
                  .set({
                    order: sql`${learningTask.order} - 1`,
                    updatedAt: new Date(),
                  })
                  .where(
                    eq(
                      learningTask.learningModuleId,
                      currentLearningModuleResult.id,
                    ) &&
                      gte(learningTask.order, currentOrder + 1) &&
                      lte(learningTask.order, targetOrder),
                  );
              } else {
                // Moving up: increase order of items between target and current
                await tx
                  .update(learningTask)
                  .set({
                    order: sql`${learningTask.order} + 1`,
                    updatedAt: new Date(),
                  })
                  .where(
                    eq(
                      learningTask.learningModuleId,
                      currentLearningModuleResult.id,
                    ) &&
                      gte(learningTask.order, targetOrder) &&
                      lte(learningTask.order, currentOrder - 1),
                  );
              }

              // Update the moved learning-task
              await tx
                .update(learningTask)
                .set({
                  order: targetOrder,
                  updatedAt: new Date(),
                })
                .where(eq(learningTask.id, learningTaskResult.id));
            }
          }
        } else {
          // Moving to a different learningModule
          // First, close the gap in the current learningModule
          await tx
            .update(learningTask)
            .set({
              order: sql`${learningTask.order} - 1`,
              updatedAt: new Date(),
            })
            .where(
              eq(
                learningTask.learningModuleId,
                currentLearningModuleResult.id,
              ) && gte(learningTask.order, learningTaskResult.order + 1),
            );

          // Determine the new order in the target learningModule
          let finalOrder: number;
          if (newOrder !== undefined) {
            // Make space in the target learningModule at the specified position
            await tx
              .update(learningTask)
              .set({
                order: sql`${learningTask.order} + 1`,
                updatedAt: new Date(),
              })
              .where(
                eq(
                  learningTask.learningModuleId,
                  targetLearningModuleResult.id,
                ) && gte(learningTask.order, newOrder),
              );
            finalOrder = newOrder;
          } else {
            // Place at the end of the target learningModule
            const [maxOrderResult] = await tx
              .select({
                maxOrder: max(learningTask.order),
              })
              .from(learningTask)
              .where(
                eq(
                  learningTask.learningModuleId,
                  targetLearningModuleResult.id,
                ),
              );
            finalOrder = (maxOrderResult?.maxOrder || 0) + 1;
          }

          // Move the learning-task to the target learningModule
          await tx
            .update(learningTask)
            .set({
              learningModuleId: targetLearningModuleResult.id,
              order: finalOrder,
              updatedAt: new Date(),
            })
            .where(eq(learningTask.id, learningTaskResult.id));
        }
      });

      // Get the final order after the move
      const [updatedLearningTask] = await db
        .select({
          order: learningTask.order,
          updatedAt: learningTask.updatedAt,
        })
        .from(learningTask)
        .where(eq(learningTask.id, learningTaskResult.id))
        .limit(1);

      if (!updatedLearningTask) {
        throw new LearningPlanError(
          500,
          "learning_plan:learning_task_update_failed",
          "Failed to load learning-task after move",
        );
      }

      // Format response
      return c.json(
        {
          id: learningTaskResult.publicId,
          learningModuleId: targetLearningModuleResult.publicId,
          order: updatedLearningTask.order,
          updatedAt: updatedLearningTask.updatedAt.toISOString(),
        },
        status.OK,
      );
    } catch (error) {
      if (error instanceof LearningPlanError) {
        throw error;
      }

      // Handle validation errors
      if (error instanceof Error && error.message.includes("validation")) {
        throw new LearningPlanError(
          400,
          "learning_plan:learning_task_validation_failed",
          "Invalid move operation data provided",
        );
      }

      console.error("Learning-task move error:", error);
      throw new LearningPlanError(
        500,
        "learning_plan:internal_error",
        "Failed to move learning-task",
      );
    }
  },
);

export default moveLearningTask;
