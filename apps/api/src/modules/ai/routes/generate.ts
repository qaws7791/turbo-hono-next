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

      // Return the generated roadmap
      return c.json(
        {
          roadmap: generatedRoadmap,
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

      // Handle validation errors
      if (error instanceof Error && error.message.includes("validation")) {
        throw new AIError(
          400,
          "ai:invalid_request",
          "Invalid request data provided",
        );
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
