import { OpenAPIHono } from "@hono/zod-openapi";
import { asc, eq } from "drizzle-orm";
import status from "http-status";
import { db } from "../../../database/client";
import {
  aiNote,
  goal,
  roadmap,
  roadmapDocument,
  subGoal,
} from "@repo/database/schema";
import { AuthContext, authMiddleware } from "../../../middleware/auth";
import { RoadmapError } from "../errors";
import { roadmapDetailRoute } from "@repo/api-spec/modules/roadmap/routes/detail";
import {
  SUB_GOAL_NOTE_STATUS,
  type SubGoalNoteStatus,
} from "../../ai/services/subgoal-note-service";

const detail = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...roadmapDetailRoute,
    middleware: [authMiddleware] as const,
  },
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

      const documents = await db
        .select()
        .from(roadmapDocument)
        .where(eq(roadmapDocument.roadmapId, roadmapData.id))
        .then((documents) =>
          documents.map((document) => ({
            id: document.publicId,
            fileName: document.fileName,
            fileSize: document.fileSize,
            fileType: document.fileType,
            storageUrl: document.storageUrl,
            roadmapId: document.roadmapId,
            uploadedAt: document.uploadedAt,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
          })),
        );

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
          subGoalCompletedAt: subGoal.completedAt,
          subGoalDueDate: subGoal.dueDate,
          subGoalMemo: subGoal.memo,
          subGoalOrder: subGoal.order,
          subGoalCreatedAt: subGoal.createdAt,
          subGoalUpdatedAt: subGoal.updatedAt,
          subGoalNoteStatus: aiNote.status,
          subGoalNoteMarkdown: aiNote.markdown,
          subGoalNoteRequestedAt: aiNote.requestedAt,
          subGoalNoteCompletedAt: aiNote.completedAt,
          subGoalNoteError: aiNote.errorMessage,
        })
        .from(goal)
        .leftJoin(subGoal, eq(goal.id, subGoal.goalId))
        .leftJoin(aiNote, eq(aiNote.subGoalId, subGoal.id))
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
          const parentGoal = goalsMap.get(row.goalId);
          const noteStatus =
            (row.subGoalNoteStatus as SubGoalNoteStatus | null) ??
            SUB_GOAL_NOTE_STATUS.idle;

          parentGoal.subGoals.push({
            id: row.subGoalPublicId!,
            title: row.subGoalTitle!,
            description: row.subGoalDescription,
            isCompleted: row.subGoalIsCompleted!,
            completedAt: row.subGoalCompletedAt?.toISOString() ?? null,
            dueDate: row.subGoalDueDate?.toISOString() || null,
            memo: row.subGoalMemo,
            order: row.subGoalOrder!,
            createdAt: row.subGoalCreatedAt!.toISOString(),
            updatedAt: row.subGoalUpdatedAt!.toISOString(),
            aiNoteStatus: noteStatus,
            aiNoteMarkdown: row.subGoalNoteMarkdown,
            aiNoteRequestedAt:
              row.subGoalNoteRequestedAt?.toISOString() ?? null,
            aiNoteCompletedAt:
              row.subGoalNoteCompletedAt?.toISOString() ?? null,
            aiNoteError: row.subGoalNoteError,
          });
        }
      }

      // Convert Map to sorted array
      const goals = Array.from(goalsMap.values()).sort(
        (a, b) => a.order - b.order,
      );

      // Format response
      const response = {
        id: roadmapData.publicId,
        emoji: roadmapData.emoji,
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
        documents,
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
