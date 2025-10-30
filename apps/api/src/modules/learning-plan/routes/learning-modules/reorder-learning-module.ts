import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { learningModule, learningPlan } from "@repo/database/schema";
import { reorderLearningModuleRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-modules/reorder-learning-module";

import { db } from "../../../../database/client";
import { authMiddleware } from "../../../../middleware/auth";
import { LearningPlanError } from "../../errors";

import type { AuthContext } from "../../../../middleware/auth";

const reorderLearningModule = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...reorderLearningModuleRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { learningPlanId, learningModuleId } = c.req.valid("param");
      const { newOrder } = c.req.valid("json");

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

      // Get total number of learningModules in this learningPlan
      const [totalLearningModulesResult] = await db
        .select({
          totalLearningModules: count(),
        })
        .from(learningModule)
        .where(eq(learningModule.learningPlanId, learningPlanResult.id));

      const totalLearningModules =
        totalLearningModulesResult?.totalLearningModules || 0;

      // Validate new order position
      if (newOrder < 1 || newOrder > totalLearningModules) {
        throw new LearningPlanError(
          400,
          "learning_plan:learning_module_order_out_of_range",
          `Order position must be between 1 and ${totalLearningModules}`,
        );
      }

      const currentOrder = learningModuleResult.order;

      // If the order is the same, no need to update
      if (currentOrder === newOrder) {
        return c.json(
          {
            id: learningModuleResult.publicId,
            order: currentOrder,
            updatedAt: new Date().toISOString(),
          },
          status.OK,
        );
      }

      // Use transaction to reorder learningModules
      const result = await db.transaction(async (tx) => {
        if (currentOrder < newOrder) {
          // Moving down: decrease order of learningModules between current and new position
          await tx
            .update(learningModule)
            .set({
              order: sql`${learningModule.order} - 1`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(learningModule.learningPlanId, learningPlanResult.id),
                gte(learningModule.order, currentOrder + 1),
                lte(learningModule.order, newOrder),
              ),
            );
        } else {
          // Moving up: increase order of learningModules between new and current position
          await tx
            .update(learningModule)
            .set({
              order: sql`${learningModule.order} + 1`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(learningModule.learningPlanId, learningPlanResult.id),
                gte(learningModule.order, newOrder),
                lte(learningModule.order, currentOrder - 1),
              ),
            );
        }

        // Update the target learning module's order
        const updatedLearningModule = await tx
          .update(learningModule)
          .set({
            order: newOrder,
            updatedAt: new Date(),
          })
          .where(eq(learningModule.id, learningModuleResult.id))
          .returning({
            id: learningModule.id,
            publicId: learningModule.publicId,
            order: learningModule.order,
            updatedAt: learningModule.updatedAt,
          });

        return updatedLearningModule[0];
      });

      if (!result) {
        throw new LearningPlanError(
          500,
          "learning_plan:learning_module_reorder_failed",
          "Failed to reorder learning module",
        );
      }

      // Return success response
      return c.json(
        {
          id: result.publicId,
          order: result.order,
          updatedAt: result.updatedAt.toISOString(),
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
          "learning_plan:invalid_learning_module_order",
          "Invalid order position provided",
        );
      }

      console.error("Learning module reorder error:", error);
      throw new LearningPlanError(
        500,
        "learning_plan:learning_module_reorder_failed",
        "Failed to reorder learning module",
      );
    }
  },
);

export default reorderLearningModule;
