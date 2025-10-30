import { OpenAPIHono } from "@hono/zod-openapi";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  ilike,
  inArray,
  lt,
  or,
  sql,
} from "drizzle-orm";
import status from "http-status";
import {
  learningModule,
  learningPlan,
  learningTask,
} from "@repo/database/schema";
import { learningPlanListRoute } from "@repo/api-spec/modules/learning-plan/routes/list";

import { db } from "../../../database/client";
import { authMiddleware } from "../../../middleware/auth";
import { LearningPlanError } from "../errors";
import { calculateCompletionPercent } from "../utils/progress";

import type { AuthContext } from "../../../middleware/auth";

// Cursor encoding/decoding utilities
type SortValue = string | Date;

interface CursorData {
  id: number;
  [key: string]: SortValue | number;
}

function encodeCursor(
  id: number,
  sortField: string,
  sortValue: SortValue,
): string {
  const cursorData = { id, [sortField]: sortValue };
  return Buffer.from(JSON.stringify(cursorData)).toString("base64");
}

function decodeCursor(cursor: string): CursorData | null {
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    return JSON.parse(decoded) as CursorData;
  } catch {
    return null;
  }
}

const list = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...learningPlanListRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const query = c.req.valid("query");
      const {
        cursor,
        limit,
        search,
        status: statusFilter,
        sort,
        order,
      } = query;

      // Decode cursor if provided
      let cursorData: CursorData | null = null;
      if (cursor) {
        cursorData = decodeCursor(cursor);
        if (!cursorData) {
          throw new LearningPlanError(
            400,
            "learning_plan:invalid_pagination_cursor",
            "Invalid pagination cursor",
          );
        }
      }

      // Build where conditions
      const conditions = [eq(learningPlan.userId, auth.user.id)];

      // Status filter
      if (statusFilter) {
        conditions.push(eq(learningPlan.status, statusFilter));
      }

      // Search filter
      if (search) {
        conditions.push(
          or(
            ilike(learningPlan.title, `%${search}%`),
            ilike(learningPlan.description, `%${search}%`),
            ilike(learningPlan.learningTopic, `%${search}%`),
          )!,
        );
      }

      // Cursor-based pagination conditions
      if (cursorData) {
        const sortColumn =
          sort === "title"
            ? learningPlan.title
            : sort === "updated_at"
              ? learningPlan.updatedAt
              : learningPlan.createdAt;

        const cursorValue = cursorData[sort] as string | Date;

        if (order === "desc") {
          // For descending order: next page has values less than cursor
          conditions.push(
            or(
              lt(sortColumn, cursorValue),
              and(
                eq(sortColumn, cursorValue),
                gt(learningPlan.id, cursorData.id),
              ),
            )!,
          );
        } else {
          // For ascending order: next page has values greater than cursor
          conditions.push(
            or(
              gt(sortColumn, cursorValue),
              and(
                eq(sortColumn, cursorValue),
                gt(learningPlan.id, cursorData.id),
              ),
            )!,
          );
        }
      }

      // Build order by
      const sortColumn =
        sort === "title"
          ? learningPlan.title
          : sort === "updated_at"
            ? learningPlan.updatedAt
            : learningPlan.createdAt;

      const orderBy =
        order === "desc"
          ? [desc(sortColumn), asc(learningPlan.id)]
          : [asc(sortColumn), asc(learningPlan.id)];

      // Execute query with limit + 1 to check if there are more items
      const results = await db
        .select({
          id: learningPlan.id,
          publicId: learningPlan.publicId,
          emoji: learningPlan.emoji,
          title: learningPlan.title,
          description: learningPlan.description,
          status: learningPlan.status,
          learningTopic: learningPlan.learningTopic,
          userLevel: learningPlan.userLevel,
          targetWeeks: learningPlan.targetWeeks,
          weeklyHours: learningPlan.weeklyHours,
          learningStyle: learningPlan.learningStyle,
          preferredResources: learningPlan.preferredResources,
          mainGoal: learningPlan.mainGoal,
          additionalRequirements: learningPlan.additionalRequirements,
          createdAt: learningPlan.createdAt,
          updatedAt: learningPlan.updatedAt,
        })
        .from(learningPlan)
        .where(and(...conditions))
        .orderBy(...orderBy)
        .limit(limit + 1);

      // Check if there are more items
      const hasNext = results.length > limit;
      const items = hasNext ? results.slice(0, limit) : results;

      // Aggregate learningModule completion progress for the current page
      const learningPlanIds = items.map((item) => item.id);
      const progressByLearningPlanId = new Map<
        number,
        { total: number; completed: number }
      >();

      if (learningPlanIds.length > 0) {
        const progressRows = await db
          .select({
            learningPlanId: learningPlan.id,
            totalLearningTasks: sql<number>`count(${learningTask.id})`,
            completedLearningTasks: sql<number>`count(case when ${learningTask.isCompleted} then 1 end)`,
          })
          .from(learningPlan)
          .leftJoin(
            learningModule,
            eq(learningModule.learningPlanId, learningPlan.id),
          )
          .leftJoin(
            learningTask,
            eq(learningTask.learningModuleId, learningModule.id),
          )
          .where(inArray(learningPlan.id, learningPlanIds))
          .groupBy(learningPlan.id);

        for (const row of progressRows) {
          const totalLearningTasks = Number(row.totalLearningTasks ?? 0);
          const completedLearningTasks = Number(
            row.completedLearningTasks ?? 0,
          );
          progressByLearningPlanId.set(row.learningPlanId, {
            total: totalLearningTasks,
            completed: completedLearningTasks,
          });
        }
      }

      // Generate next cursor
      let nextCursor: string | null = null;
      if (hasNext && items.length > 0) {
        const lastItem = items[items.length - 1];
        if (!lastItem) {
          throw new LearningPlanError(
            500,
            "learning_plan:internal_error",
            "Failed to determine next pagination cursor",
          );
        }
        const sortValue =
          sort === "title"
            ? lastItem.title
            : sort === "updated_at"
              ? lastItem.updatedAt
              : lastItem.createdAt;
        nextCursor = encodeCursor(lastItem.id, sort, sortValue);
      }

      // Get total count for the user (excluding cursor pagination conditions)
      const baseConditions = [eq(learningPlan.userId, auth.user.id)];

      // Add status filter if provided
      if (statusFilter) {
        baseConditions.push(eq(learningPlan.status, statusFilter));
      }

      // Add search filter if provided
      if (search) {
        baseConditions.push(
          or(
            ilike(learningPlan.title, `%${search}%`),
            ilike(learningPlan.description, `%${search}%`),
            ilike(learningPlan.learningTopic, `%${search}%`),
          )!,
        );
      }

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(learningPlan)
        .where(and(...baseConditions));

      const total = totalResult[0]?.count || 0;

      // Format response
      const formattedItems = items.map((item) => {
        const progress = progressByLearningPlanId.get(item.id) ?? {
          total: 0,
          completed: 0,
        };

        const learningModuleCompletionPercent = calculateCompletionPercent(
          progress.total,
          progress.completed,
        );

        return {
          id: item.publicId,
          emoji: item.emoji,
          title: item.title,
          description: item.description,
          status: item.status as "active" | "archived",
          learningModuleCompletionPercent,
          learningTopic: item.learningTopic,
          userLevel: item.userLevel,
          targetWeeks: item.targetWeeks,
          weeklyHours: item.weeklyHours,
          learningStyle: item.learningStyle,
          preferredResources: item.preferredResources,
          mainGoal: item.mainGoal,
          additionalRequirements: item.additionalRequirements,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        };
      });

      return c.json(
        {
          items: formattedItems,
          pagination: {
            hasNext,
            nextCursor,
            total,
          },
        },
        status.OK,
      );
    } catch (error) {
      if (error instanceof LearningPlanError) {
        throw error;
      }

      console.error("Learning plan list error:", error);
      throw new LearningPlanError(
        500,
        "learning_plan:internal_error",
        "Failed to retrieve learningPlan list",
      );
    }
  },
);

export default list;
