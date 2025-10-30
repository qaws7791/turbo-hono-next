import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { eq } from "drizzle-orm";
import { learningModule, learningPlan } from "@repo/database/schema";
import { updateLearningModuleRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-modules/update-learning-module";

import { db } from "../../../../database/client";
import { authMiddleware } from "../../../../middleware/auth";
import { LearningPlanError } from "../../errors";

import type { AuthContext } from "../../../../middleware/auth";

const updateLearningModule = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...updateLearningModuleRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { learningPlanId, learningModuleId } = c.req.valid("param");
      const body = c.req.valid("json");

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
          403,
          "learning_plan:learning_module_access_denied",
          "Learning module does not belong to this learningPlan",
        );
      }

      // Prepare update data - only include fields that are provided
      const updateData: Partial<typeof learningModule.$inferInsert> = {};

      if (body.title !== undefined) {
        updateData.title = body.title;
      }

      if (body.description !== undefined) {
        updateData.description = body.description || null;
      }

      if (body.isExpanded !== undefined) {
        updateData.isExpanded = body.isExpanded;
      }

      // Add updated timestamp
      updateData.updatedAt = new Date();

      // If no fields to update, return error
      if (Object.keys(updateData).length === 1) {
        // Only updatedAt
        throw new LearningPlanError(
          400,
          "learning_plan:learning_module_validation_failed",
          "No valid fields provided for update",
        );
      }

      // Update learningModule in database
      const [updatedLearningModule] = await db
        .update(learningModule)
        .set(updateData)
        .where(eq(learningModule.id, learningModuleResult.id))
        .returning({
          id: learningModule.id,
          publicId: learningModule.publicId,
          title: learningModule.title,
          description: learningModule.description,
          order: learningModule.order,
          isExpanded: learningModule.isExpanded,
          createdAt: learningModule.createdAt,
          updatedAt: learningModule.updatedAt,
        });

      if (!updatedLearningModule) {
        throw new LearningPlanError(
          500,
          "learning_plan:learning_module_update_failed",
          "Failed to update learning module",
        );
      }

      // Format response
      return c.json(
        {
          id: updatedLearningModule.publicId,
          title: updatedLearningModule.title,
          description: updatedLearningModule.description,
          order: updatedLearningModule.order,
          isExpanded: updatedLearningModule.isExpanded,
          createdAt: updatedLearningModule.createdAt.toISOString(),
          updatedAt: updatedLearningModule.updatedAt.toISOString(),
          aiNoteStatus: "idle" as const,
          aiNoteMarkdown: null,
          aiNoteRequestedAt: null,
          aiNoteCompletedAt: null,
          aiNoteError: null,
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
          "learning_plan:learning_module_validation_failed",
          "Invalid learningModule data provided",
        );
      }

      console.error("Learning module update error:", error);
      throw new LearningPlanError(
        500,
        "learning_plan:internal_error",
        "Failed to update learning module",
      );
    }
  },
);

export default updateLearningModule;
