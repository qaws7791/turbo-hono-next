import { google } from "@ai-sdk/google";
import { OpenAPIHono } from "@hono/zod-openapi";
import { generateObject } from "ai";
import { and, eq } from "drizzle-orm";
import status from "http-status";
import { learningPlanDocument } from "@repo/database/schema";
import { generateLearningPlanRoute } from "@repo/api-spec/modules/ai/routes";

import { db } from "../../../database/client";
import { authMiddleware } from "../../../middleware/auth";
import { AIError } from "../errors";
import { generateLearningPlanPrompt } from "../prompts/learning-plan-prompts";
import { GeneratedLearningPlanSchema } from "../schema";
import { saveLearningPlanToDatabase } from "../services/learning-plan-service";

import type { AuthContext } from "../../../middleware/auth";
import type { ModelMessage } from "ai";

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
        throw new AIError(
          401,
          "ai:authentication_required",
          "User authentication required",
        );
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

      const [document] = documentId
        ? await db
            .select()
            .from(learningPlanDocument)
            .where(
              and(
                eq(learningPlanDocument.publicId, documentId),
                eq(learningPlanDocument.userId, auth.user.id),
              ),
            )
            .limit(1)
        : [null];

      if (documentId && !document) {
        throw new AIError(404, "ai:document_not_found", "Document not found");
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
        throw new AIError(
          500,
          "ai:generation_failed",
          "Failed to generate learningPlan structure",
        );
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

      // Link documents to the learningPlan if provided
      if (documentId) {
        await db
          .update(learningPlanDocument)
          .set({ learningPlanId: savedLearningPlan.id })
          .where(
            and(
              eq(learningPlanDocument.publicId, documentId),
              eq(learningPlanDocument.userId, auth.user.id),
            ),
          );
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
      if (error instanceof AIError) {
        throw error;
      }

      // Handle AI SDK specific errors
      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = error.message as string;

        if (
          errorMessage.includes("quota") ||
          errorMessage.includes("rate limit")
        ) {
          throw new AIError(
            429,
            "ai:quota_exceeded",
            "API quota exceeded. Please try again later.",
          );
        }

        if (
          errorMessage.includes("model") ||
          errorMessage.includes("unavailable")
        ) {
          throw new AIError(
            503,
            "ai:model_unavailable",
            "AI model is currently unavailable. Please try again later.",
          );
        }

        if (
          errorMessage.includes("parsing") ||
          errorMessage.includes("schema")
        ) {
          throw new AIError(
            500,
            "ai:parsing_failed",
            "Failed to parse AI response. Please try again.",
          );
        }
      }

      // Handle database errors
      if (error instanceof Error) {
        if (error.message.includes("Failed to create")) {
          throw new AIError(
            500,
            "ai:database_error",
            "Failed to save learningPlan to database",
          );
        }

        if (error.message.includes("validation")) {
          throw new AIError(
            400,
            "ai:invalid_request",
            "Invalid request data provided",
          );
        }

        if (error.message.includes("transaction")) {
          throw new AIError(
            500,
            "ai:database_transaction_failed",
            "Database transaction failed while saving learningPlan",
          );
        }
      }

      console.error("AI learningPlan generation error:", error);
      throw new AIError(
        500,
        "ai:internal_error",
        "Failed to generate learningPlan due to internal error",
      );
    }
  },
);

export default generateLearningPlan;
