import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { nanoid } from "nanoid";
import { eq, max } from "drizzle-orm";
import { learningModule, learningPlan } from "@repo/database/schema";
import { createLearningModuleRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-modules/create-learning-module";

import { db } from "../../../../database/client";
import { authMiddleware } from "../../../../middleware/auth";
import { LearningPlanError } from "../../errors";

import type { AuthContext } from "../../../../middleware/auth";

const createLearningModule = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...createLearningModuleRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { learningPlanId } = c.req.valid("param");
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
          "learning_plan:access_denied",
          "You do not have permission to modify this learning plan",
        );
      }

      // Get the next order value for this learningPlan
      const [maxOrderResult] = await db
        .select({
          maxOrder: max(learningModule.order),
        })
        .from(learningModule)
        .where(eq(learningModule.learningPlanId, learningPlanResult.id));

      const nextOrder = (maxOrderResult?.maxOrder || 0) + 1;

      // Generate unique public ID
      const publicId = nanoid();

      // Extract request data
      const { title, description, isExpanded = true } = body;

      // Create learningModule in database
      const [createdLearningModule] = await db
        .insert(learningModule)
        .values({
          publicId,
          learningPlanId: learningPlanResult.id,
          title,
          description: description || null,
          order: nextOrder,
          isExpanded,
        })
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

      if (!createdLearningModule) {
        throw new LearningPlanError(
          500,
          "learning_plan:learning_module_creation_failed",
          "Failed to create learning module",
        );
      }

      // Format response
      return c.json(
        {
          id: createdLearningModule.publicId,
          title: createdLearningModule.title,
          description: createdLearningModule.description,
          order: createdLearningModule.order,
          isExpanded: createdLearningModule.isExpanded,
          createdAt: createdLearningModule.createdAt.toISOString(),
          updatedAt: createdLearningModule.updatedAt.toISOString(),
          aiNoteStatus: "idle" as const,
          aiNoteMarkdown: null,
          aiNoteRequestedAt: null,
          aiNoteCompletedAt: null,
          aiNoteError: null,
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
          "learning_plan:learning_module_validation_failed",
          "Invalid learning module data provided",
        );
      }

      console.error("Learning module creation error:", error);
      throw new LearningPlanError(
        500,
        "learning_plan:internal_error",
        "Failed to create learning module",
      );
    }
  },
);

export default createLearningModule;
