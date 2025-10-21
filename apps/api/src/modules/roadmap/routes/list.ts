import { OpenAPIHono } from "@hono/zod-openapi";
import { and, asc, desc, eq, gt, ilike, inArray, lt, or, sql } from "drizzle-orm";
import status from "http-status";
import { db } from "../../../database/client";
import { goal, roadmap, subGoal } from "@repo/database/schema";
import { AuthContext, authMiddleware } from "../../../middleware/auth";
import { RoadmapError } from "../errors";
import { roadmapListRoute } from "@repo/api-spec/modules/roadmap/routes/list";
import { calculateCompletionPercent } from "../utils/progress";

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
    ...roadmapListRoute,
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
          throw new RoadmapError(
            400,
            "roadmap:invalid_pagination_cursor",
            "Invalid pagination cursor",
          );
        }
      }

      // Build where conditions
      const conditions = [eq(roadmap.userId, auth.user.id)];

      // Status filter
      if (statusFilter) {
        conditions.push(eq(roadmap.status, statusFilter));
      }

      // Search filter
      if (search) {
        conditions.push(
          or(
            ilike(roadmap.title, `%${search}%`),
            ilike(roadmap.description, `%${search}%`),
            ilike(roadmap.learningTopic, `%${search}%`),
          )!,
        );
      }

      // Cursor-based pagination conditions
      if (cursorData) {
        const sortColumn =
          sort === "title"
            ? roadmap.title
            : sort === "updated_at"
              ? roadmap.updatedAt
              : roadmap.createdAt;

        const cursorValue = cursorData[sort] as string | Date;

        if (order === "desc") {
          // For descending order: next page has values less than cursor
          conditions.push(
            or(
              lt(sortColumn, cursorValue),
              and(eq(sortColumn, cursorValue), gt(roadmap.id, cursorData.id)),
            )!,
          );
        } else {
          // For ascending order: next page has values greater than cursor
          conditions.push(
            or(
              gt(sortColumn, cursorValue),
              and(eq(sortColumn, cursorValue), gt(roadmap.id, cursorData.id)),
            )!,
          );
        }
      }

      // Build order by
      const sortColumn =
        sort === "title"
          ? roadmap.title
          : sort === "updated_at"
            ? roadmap.updatedAt
            : roadmap.createdAt;

      const orderBy =
        order === "desc"
          ? [desc(sortColumn), asc(roadmap.id)]
          : [asc(sortColumn), asc(roadmap.id)];

      // Execute query with limit + 1 to check if there are more items
      const results = await db
        .select({
          id: roadmap.id,
          publicId: roadmap.publicId,
          emoji: roadmap.emoji,
          title: roadmap.title,
          description: roadmap.description,
          status: roadmap.status,
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
        })
        .from(roadmap)
        .where(and(...conditions))
        .orderBy(...orderBy)
        .limit(limit + 1);

      // Check if there are more items
      const hasNext = results.length > limit;
      const items = hasNext ? results.slice(0, limit) : results;

      // Aggregate goal completion progress for the current page
      const roadmapIds = items.map((item) => item.id);
      const progressByRoadmapId = new Map<
        number,
        { total: number; completed: number }
      >();

      if (roadmapIds.length > 0) {
        const progressRows = await db
          .select({
            roadmapId: roadmap.id,
            totalSubGoals: sql<number>`count(${subGoal.id})`,
            completedSubGoals: sql<number>`count(case when ${subGoal.isCompleted} then 1 end)`,
          })
          .from(roadmap)
          .leftJoin(goal, eq(goal.roadmapId, roadmap.id))
          .leftJoin(subGoal, eq(subGoal.goalId, goal.id))
          .where(inArray(roadmap.id, roadmapIds))
          .groupBy(roadmap.id);

        for (const row of progressRows) {
          const totalSubGoals = Number(row.totalSubGoals ?? 0);
          const completedSubGoals = Number(row.completedSubGoals ?? 0);
          progressByRoadmapId.set(row.roadmapId, {
            total: totalSubGoals,
            completed: completedSubGoals,
          });
        }
      }

      // Generate next cursor
      let nextCursor: string | null = null;
      if (hasNext && items.length > 0) {
        const lastItem = items[items.length - 1];
        const sortValue =
          sort === "title"
            ? lastItem.title
            : sort === "updated_at"
              ? lastItem.updatedAt
              : lastItem.createdAt;
        nextCursor = encodeCursor(lastItem.id, sort, sortValue);
      }

      // Get total count for the user (excluding cursor pagination conditions)
      const baseConditions = [eq(roadmap.userId, auth.user.id)];

      // Add status filter if provided
      if (statusFilter) {
        baseConditions.push(eq(roadmap.status, statusFilter));
      }

      // Add search filter if provided
      if (search) {
        baseConditions.push(
          or(
            ilike(roadmap.title, `%${search}%`),
            ilike(roadmap.description, `%${search}%`),
            ilike(roadmap.learningTopic, `%${search}%`),
          )!,
        );
      }

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(roadmap)
        .where(and(...baseConditions));

      const total = totalResult[0]?.count || 0;

      // Format response
      const formattedItems = items.map((item) => {
        const progress = progressByRoadmapId.get(item.id) ?? {
          total: 0,
          completed: 0,
        };

        const goalCompletionPercent = calculateCompletionPercent(
          progress.total,
          progress.completed,
        );

        return {
          id: item.publicId,
          emoji: item.emoji,
          title: item.title,
          description: item.description,
          status: item.status as "active" | "archived",
          goalCompletionPercent,
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
      if (error instanceof RoadmapError) {
        throw error;
      }

      console.error("Roadmap list error:", error);
      throw new RoadmapError(
        500,
        "roadmap:internal_error",
        "Failed to retrieve roadmap list",
      );
    }
  },
);

export default list;
