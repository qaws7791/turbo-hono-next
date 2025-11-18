import { OpenAPIHono } from "@hono/zod-openapi";
import { generateLearningPlanRoute as generateLearningPlanRouteSpec } from "@repo/api-spec/modules/ai/routes";
import status from "http-status";

import { generateLearningPlan } from "../../../external/ai/features/learning-plan/generator";
import { log } from "../../../lib/logger";
import { authMiddleware } from "../../../middleware/auth";
import { AuthErrors } from "../../auth/errors";
import { documentService } from "../../documents/services/document.service";
import { AIErrors } from "../errors";
import { saveLearningPlanToDatabase } from "../services/learning-plan-service";

import type { AuthContext } from "../../../middleware/auth";

const generateLearningPlanRoute = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...generateLearningPlanRouteSpec,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const body = c.req.valid("json");
      const auth = c.get("auth");

      if (!auth?.user?.id) {
        throw AuthErrors.unauthorized();
      }

      const {
        learningTopic,
        userLevel,
        targetWeeks,
        weeklyHours,
        learningStyle,
        preferredResources,
        mainGoal,
        additionalRequirements,
        documentId,
      } = body;

      // Get document via service if documentId is provided
      let document = null;
      if (documentId) {
        try {
          document = await documentService.getDocumentDetail({
            publicId: documentId,
            userId: auth.user.id,
          });
        } catch {
          throw AIErrors.documentNotFound();
        }
      }

      // fetch pdf from storage
      const pdfContents: ArrayBuffer | null = document
        ? await fetch(document.storageUrl).then((res) => res.arrayBuffer())
        : null;

      // Generate structured learningPlan using AI
      const generatedLearningPlan = await generateLearningPlan({
        promptData: {
          learningTopic,
          userLevel,
          targetWeeks,
          weeklyHours,
          learningStyle,
          preferredResources,
          mainGoal,
          additionalRequirements,
          includePdfContents: pdfContents !== null,
        },
        pdfContents,
      });

      // Save the generated learningPlan to the database with transaction
      log.debug("Generated learningPlan", {
        learningPlan: generatedLearningPlan,
      });
      const savedLearningPlan = await saveLearningPlanToDatabase({
        userId: auth.user.id,
        generatedLearningPlan,
        personalizedData: {
          learningTopic,
          userLevel,
          targetWeeks,
          weeklyHours,
          learningStyle,
          preferredResources,
          mainGoal,
          additionalRequirements,
        },
      });

      // Link document to the learning plan if provided
      if (documentId) {
        await documentService.linkToLearningPlan({
          publicId: documentId,
          userId: auth.user.id,
          learningPlanId: savedLearningPlan.id,
        });
      }

      // Return the saved learningPlan data
      return c.json(
        {
          learningPlan: {
            id: savedLearningPlan.publicId,
            emoji: savedLearningPlan.emoji,
            title: savedLearningPlan.title,
            description: savedLearningPlan.description,
            status: savedLearningPlan.status,
            learningTopic: savedLearningPlan.learningTopic,
            userLevel: savedLearningPlan.userLevel,
            targetWeeks: savedLearningPlan.targetWeeks,
            weeklyHours: savedLearningPlan.weeklyHours,
            learningStyle: savedLearningPlan.learningStyle,
            preferredResources: savedLearningPlan.preferredResources,
            mainGoal: savedLearningPlan.mainGoal,
            additionalRequirements:
              savedLearningPlan.additionalRequirements || undefined,
            learningModules: savedLearningPlan.learningModules.map(
              (learningModule) => ({
                id: learningModule.publicId,
                title: learningModule.title,
                description: learningModule.description,
                order: learningModule.order,
                isExpanded: learningModule.isExpanded,
                learningTasks: learningModule.learningTasks.map(
                  (learningTask) => ({
                    id: learningTask.publicId,
                    title: learningTask.title,
                    description: learningTask.description,
                    order: learningTask.order,
                    isCompleted: learningTask.isCompleted,
                    dueDate: learningTask.dueDate?.toISOString(),
                    memo: learningTask.memo,
                  }),
                ),
              }),
            ),
            createdAt: savedLearningPlan.createdAt.toISOString(),
            updatedAt: savedLearningPlan.updatedAt.toISOString(),
          },
          message: "로드맵이 성공적으로 생성되었습니다.",
        },
        status.OK,
      );
    } catch (error) {
      // Handle known AI errors
      if (error instanceof AIErrors.generationFailed().constructor) {
        throw error;
      }

      // Handle AI SDK specific errors
      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = error.message as string;

        if (
          errorMessage.includes("quota") ||
          errorMessage.includes("rate limit")
        ) {
          throw AIErrors.apiLimitExceeded();
        }

        if (
          errorMessage.includes("model") ||
          errorMessage.includes("unavailable")
        ) {
          throw AIErrors.apiUnavailable();
        }

        if (
          errorMessage.includes("parsing") ||
          errorMessage.includes("schema")
        ) {
          throw AIErrors.generationFailed({
            message: "Failed to parse AI response",
          });
        }
      }

      // Handle database errors
      if (error instanceof Error) {
        if (error.message.includes("Failed to create")) {
          throw AIErrors.databaseError({
            message: "Failed to save learningPlan to database",
          });
        }

        if (error.message.includes("validation")) {
          throw AIErrors.invalidPrompt({
            message: "Invalid request data provided",
          });
        }

        if (error.message.includes("transaction")) {
          throw AIErrors.transactionFailed({
            message: "Database transaction failed while saving learningPlan",
          });
        }
      }

      log.error("AI learningPlan generation error", error);
      throw AIErrors.generationFailed({
        message: "Failed to generate learningPlan due to internal error",
      });
    }
  },
);

export default generateLearningPlanRoute;
