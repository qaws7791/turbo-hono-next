import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { asc, eq } from "drizzle-orm";
import status from "http-status";
import { db } from "../../../database/client";
import { goal, roadmap, subGoal } from "../../../database/schema";
import { AuthContext, authMiddleware } from "../../../middleware/auth";
import { RoadmapError } from "../errors";
import {
  ErrorResponseSchema,
  RoadmapDetailResponseSchema,
  RoadmapParamsSchema,
} from "../schema";

const detail = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  createRoute({
    tags: ["Roadmap"],
    method: "get",
    path: "/roadmaps/{roadmapId}",
    summary: "Get detailed roadmap with goals and sub-goals",
    middleware: [authMiddleware] as const,
    request: {
      params: RoadmapParamsSchema,
    },
    responses: {
      [status.OK]: {
        content: {
          "application/json": {
            schema: RoadmapDetailResponseSchema,
          },
        },
        description: "Roadmap details retrieved successfully",
      },
      [status.NOT_FOUND]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Roadmap not found",
      },
      [status.FORBIDDEN]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Access denied to this roadmap",
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
      const { roadmapId } = c.req.valid("param");

      // Get roadmap by public ID and verify ownership
      const roadmapResult = await db
        .select()
        .from(roadmap)
        .where(eq(roadmap.publicId, roadmapId))
        .limit(1);

      const roadmapData = roadmapResult[0];
      if (!roadmapData) {
        throw new RoadmapError(
          404,
          "roadmap:roadmap_not_found",
          "Roadmap not found",
        );
      }

      // Check if user owns the roadmap
      if (roadmapData.userId !== auth.user.id) {
        throw new RoadmapError(
          403,
          "roadmap:access_denied",
          "Access denied to this roadmap",
        );
      }

      // Get goals with their sub-goals
      const goalsResult = await db
        .select({
          // Goal fields
          goalId: goal.id,
          goalPublicId: goal.publicId,
          goalTitle: goal.title,
          goalDescription: goal.description,
          goalOrder: goal.order,
          goalIsExpanded: goal.isExpanded,
          goalCreatedAt: goal.createdAt,
          goalUpdatedAt: goal.updatedAt,
          // SubGoal fields (nullable when no sub-goals exist)
          subGoalId: subGoal.id,
          subGoalPublicId: subGoal.publicId,
          subGoalTitle: subGoal.title,
          subGoalDescription: subGoal.description,
          subGoalIsCompleted: subGoal.isCompleted,
          subGoalDueDate: subGoal.dueDate,
          subGoalMemo: subGoal.memo,
          subGoalOrder: subGoal.order,
          subGoalCreatedAt: subGoal.createdAt,
          subGoalUpdatedAt: subGoal.updatedAt,
        })
        .from(goal)
        .leftJoin(subGoal, eq(goal.id, subGoal.goalId))
        .where(eq(goal.roadmapId, roadmapData.id))
        .orderBy(asc(goal.order), asc(subGoal.order));

      // Group goals with their sub-goals
      const goalsMap = new Map();

      for (const row of goalsResult) {
        if (!goalsMap.has(row.goalId)) {
          goalsMap.set(row.goalId, {
            id: row.goalPublicId,
            title: row.goalTitle,
            description: row.goalDescription,
            order: row.goalOrder,
            isExpanded: row.goalIsExpanded,
            createdAt: row.goalCreatedAt.toISOString(),
            updatedAt: row.goalUpdatedAt.toISOString(),
            subGoals: [],
          });
        }

        // Add sub-goal if it exists
        if (row.subGoalId) {
          goalsMap.get(row.goalId).subGoals.push({
            id: row.subGoalPublicId!,
            title: row.subGoalTitle!,
            description: row.subGoalDescription,
            isCompleted: row.subGoalIsCompleted!,
            dueDate: row.subGoalDueDate?.toISOString() || null,
            memo: row.subGoalMemo,
            order: row.subGoalOrder!,
            createdAt: row.subGoalCreatedAt!.toISOString(),
            updatedAt: row.subGoalUpdatedAt!.toISOString(),
          });
        }
      }

      // Convert Map to sorted array
      const goals = Array.from(goalsMap.values()).sort((a, b) => a.order - b.order);

      // Format response
      const response = {
        id: roadmapData.publicId,
        title: roadmapData.title,
        description: roadmapData.description,
        status: roadmapData.status as "active" | "archived",
        learningTopic: roadmapData.learningTopic,
        userLevel: roadmapData.userLevel,
        targetWeeks: roadmapData.targetWeeks,
        weeklyHours: roadmapData.weeklyHours,
        learningStyle: roadmapData.learningStyle,
        preferredResources: roadmapData.preferredResources,
        mainGoal: roadmapData.mainGoal,
        additionalRequirements: roadmapData.additionalRequirements,
        createdAt: roadmapData.createdAt.toISOString(),
        updatedAt: roadmapData.updatedAt.toISOString(),
        goals,
      };

      return c.json(response, status.OK);
    } catch (error) {
      if (error instanceof RoadmapError) {
        throw error;
      }

      console.error("Roadmap detail error:", error);
      throw new RoadmapError(
        500,
        "roadmap:internal_error",
        "Failed to retrieve roadmap details",
      );
    }
  },
);

export default detail;
