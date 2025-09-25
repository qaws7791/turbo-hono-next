import { google } from "@ai-sdk/google";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { generateObject } from "ai";
import status from "http-status";
import { AuthContext, authMiddleware } from "../../../middleware/auth";
import { AIError } from "../errors";
import { generateRoadmapPrompt } from "../prompts/roadmap-prompts";
import {
  ErrorResponseSchema,
  GeneratedRoadmapSchema,
  GenerateRoadmapRequestSchema,
  GenerateRoadmapResponseSchema,
} from "../schema";
import { saveRoadmapToDatabase } from "../services/roadmap-service";

const generateRoadmap = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  createRoute({
    tags: ["AI"],
    method: "post",
    path: "/ai/roadmaps/generate",
    summary: "Generate a personalized learning roadmap using AI",
    middleware: [authMiddleware] as const,
    request: {
      body: {
        content: {
          "application/json": {
            schema: GenerateRoadmapRequestSchema,
          },
        },
      },
    },
    responses: {
      [status.OK]: {
        content: {
          "application/json": {
            schema: GenerateRoadmapResponseSchema,
          },
        },
        description: "Roadmap generated successfully",
      },
      [status.BAD_REQUEST]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Bad request - validation failed",
      },
      [status.UNAUTHORIZED]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Authentication required",
      },
      [status.TOO_MANY_REQUESTS]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Rate limit exceeded",
      },
      [status.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Internal server error",
      },
    },
  }),
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
      } = body;

      // Generate structured roadmap using AI
      const prompt = generateRoadmapPrompt({
        learningTopic,
        userLevel,
        targetWeeks,
        weeklyHours,
        learningStyle,
        preferredResources,
        mainGoal,
        additionalRequirements,
      });

      const result = await generateObject({
        model: google("gemini-2.5-flash-lite"),
        schema: GeneratedRoadmapSchema,
        prompt,
        temperature: 0.7,
      });

      if (!result.object) {
        throw new AIError(
          500,
          "ai:generation_failed",
          "Failed to generate roadmap structure",
        );
      }

      const generatedRoadmap = result.object;

      // Save the generated roadmap to the database with transaction
      console.log(
        "Generated roadmap:",
        JSON.stringify(generatedRoadmap, null, 2),
      );
      const savedRoadmap = await saveRoadmapToDatabase({
        userId: auth.user.id,
        generatedRoadmap,
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

      // Return the saved roadmap data
      return c.json(
        {
          roadmap: {
            id: savedRoadmap.publicId,
            title: savedRoadmap.title,
            description: savedRoadmap.description,
            status: savedRoadmap.status,
            learningTopic: savedRoadmap.learningTopic,
            userLevel: savedRoadmap.userLevel,
            targetWeeks: savedRoadmap.targetWeeks,
            weeklyHours: savedRoadmap.weeklyHours,
            learningStyle: savedRoadmap.learningStyle,
            preferredResources: savedRoadmap.preferredResources,
            mainGoal: savedRoadmap.mainGoal,
            additionalRequirements:
              savedRoadmap.additionalRequirements || undefined,
            goals: savedRoadmap.goals.map((goal) => ({
              id: goal.publicId,
              title: goal.title,
              description: goal.description,
              order: goal.order,
              isExpanded: goal.isExpanded,
              subGoals: goal.subGoals.map((subGoal) => ({
                id: subGoal.publicId,
                title: subGoal.title,
                description: subGoal.description,
                order: subGoal.order,
                isCompleted: subGoal.isCompleted,
                dueDate: subGoal.dueDate?.toISOString(),
                memo: subGoal.memo,
              })),
            })),
            createdAt: savedRoadmap.createdAt.toISOString(),
            updatedAt: savedRoadmap.updatedAt.toISOString(),
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
            "Failed to save roadmap to database",
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
            "Database transaction failed while saving roadmap",
          );
        }
      }

      console.error("AI roadmap generation error:", error);
      throw new AIError(
        500,
        "ai:internal_error",
        "Failed to generate roadmap due to internal error",
      );
    }
  },
);

export default generateRoadmap;
