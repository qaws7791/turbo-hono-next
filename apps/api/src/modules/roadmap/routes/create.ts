import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { nanoid } from "nanoid";
import { db } from "../../../database/client";
import { roadmap } from "@repo/database/schema";
import { authMiddleware, AuthContext } from "../../../middleware/auth";
import { RoadmapError } from "../errors";
import {
  ErrorResponseSchema,
  RoadmapCreateRequestSchema,
  RoadmapCreateResponseSchema,
} from "../schema";
import { RoadmapEmoji } from "../utils/emoji";

const create = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  createRoute({
    tags: ["Roadmap"],
    method: "post",
    path: "/roadmaps",
    summary: "Create a new roadmap",
    middleware: [authMiddleware] as const,
    request: {
      body: {
        content: {
          "application/json": {
            schema: RoadmapCreateRequestSchema,
          },
        },
      },
    },
    responses: {
      [status.CREATED]: {
        content: {
          "application/json": {
            schema: RoadmapCreateResponseSchema,
          },
        },
        description: "Roadmap created successfully",
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
      const auth = c.get("auth");
      const body = c.req.valid("json");

      // Validate required fields
      const {
        title,
        emoji,
        description,
        learningTopic,
        userLevel,
        targetWeeks,
        weeklyHours,
        learningStyle,
        preferredResources,
        mainGoal,
        additionalRequirements,
      } = body;

      // Generate unique public ID
      const publicId = nanoid(16);
      const resolvedEmoji = RoadmapEmoji.ensure(emoji, learningTopic);

      // Create roadmap in database
      const result = await db
        .insert(roadmap)
        .values({
          publicId,
          userId: auth.user.id,
          title,
          description: description || null,
          status: "active",
          emoji: resolvedEmoji,
          learningTopic,
          userLevel,
          targetWeeks,
          weeklyHours,
          learningStyle,
          preferredResources,
          mainGoal,
          additionalRequirements: additionalRequirements || null,
        })
        .returning({
          id: roadmap.id,
          publicId: roadmap.publicId,
          title: roadmap.title,
          description: roadmap.description,
          status: roadmap.status,
          emoji: roadmap.emoji,
          learningTopic: roadmap.learningTopic,
          userLevel: roadmap.userLevel,
          targetWeeks: roadmap.targetWeeks,
          weeklyHours: roadmap.weeklyHours,
          learningStyle: roadmap.learningStyle,
          preferredResources: roadmap.preferredResources,
          mainGoal: roadmap.mainGoal,
          additionalRequirements: roadmap.additionalRequirements,
          createdAt: roadmap.createdAt,
          updatedAt: roadmap.updatedAt,
        });

      if (!result || result.length === 0) {
        throw new RoadmapError(
          500,
          "roadmap:creation_failed",
          "Failed to create roadmap"
        );
      }

      const createdRoadmap = result[0];

      // Format response
      return c.json(
        {
          id: createdRoadmap.publicId,
          title: createdRoadmap.title,
          emoji: createdRoadmap.emoji,
          description: createdRoadmap.description,
          status: createdRoadmap.status as "active" | "archived",
          learningTopic: createdRoadmap.learningTopic,
          userLevel: createdRoadmap.userLevel,
          targetWeeks: createdRoadmap.targetWeeks,
          weeklyHours: createdRoadmap.weeklyHours,
          learningStyle: createdRoadmap.learningStyle,
          preferredResources: createdRoadmap.preferredResources,
          mainGoal: createdRoadmap.mainGoal,
          additionalRequirements: createdRoadmap.additionalRequirements,
          createdAt: createdRoadmap.createdAt.toISOString(),
          updatedAt: createdRoadmap.updatedAt.toISOString(),
        },
        status.CREATED
      );
    } catch (error) {
      if (error instanceof RoadmapError) {
        throw error;
      }

      // Handle validation errors
      if (error instanceof Error && error.message.includes("validation")) {
        throw new RoadmapError(
          400,
          "roadmap:validation_failed",
          "Invalid roadmap data provided"
        );
      }

      console.error("Roadmap creation error:", error);
      throw new RoadmapError(
        500,
        "roadmap:internal_error",
        "Failed to create roadmap"
      );
    }
  }
);

export default create;
