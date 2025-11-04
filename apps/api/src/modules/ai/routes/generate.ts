import { google } from "@ai-sdk/google";
import { OpenAPIHono } from "@hono/zod-openapi";
import { generateLearningPlanRoute } from "@repo/api-spec/modules/ai/routes";
import { generateObject } from "ai";
import status from "http-status";

import { authMiddleware } from "../../../middleware/auth";
import { AuthErrors } from "../../auth/errors";
import { documentService } from "../../documents/services/document.service";
import { AIErrors } from "../errors";
import { generateLearningPlanPrompt } from "../prompts/learning-plan-prompts";
import { GeneratedLearningPlanSchema } from "../schema";
import { saveLearningPlanToDatabase } from "../services/learning-plan-service";

import type { ModelMessage } from "ai";
import type { AuthContext } from "../../../middleware/auth";

const generateLearningPlan = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...generateLearningPlanRoute,
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
      const prompt = generateLearningPlanPrompt({
        learningTopic,
        userLevel,
        targetWeeks,
        weeklyHours,
        learningStyle,
        preferredResources,
        mainGoal,
        additionalRequirements,
        includePdfContents: pdfContents !== null,
      });

      const messages: Array<ModelMessage> = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ];

      if (pdfContents) {
        messages.push({
          role: "user",
          content: [
            {
              type: "file",
              data: Buffer.from(pdfContents),
              mediaType: "application/pdf",
            },
          ],
        });
      }

      const result = await generateObject({
        model: google("gemini-2.5-flash-lite"),
        schema: GeneratedLearningPlanSchema,
        temperature: 0.7,
        messages: messages,
      });

      if (!result.object) {
        throw AIErrors.generationFailed();
      }

      const generatedLearningPlan = result.object;

      // Save the generated learningPlan to the database with transaction
      console.log(
        "Generated learningPlan:",
        JSON.stringify(generatedLearningPlan, null, 2),
      );
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

      console.error("AI learningPlan generation error:", error);
      throw AIErrors.generationFailed({
        message: "Failed to generate learningPlan due to internal error",
      });
    }
  },
);

export default generateLearningPlan;
