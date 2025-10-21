import { OpenAPIHono } from "@hono/zod-openapi";
import { and, asc, eq, gte, isNotNull, lte } from "drizzle-orm";
import status from "http-status";
import { db } from "../../../database/client";
import { goal, roadmap, subGoal } from "@repo/database/schema";
import { AuthContext, authMiddleware } from "../../../middleware/auth";
import { ProgressError } from "../errors";
import { dailyProgressRoute } from "@repo/api-spec/modules/progress/routes";

const DEFAULT_WINDOW_DAYS = 30;

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

const startOfDayUtc = (date: Date) => {
  const value = new Date(date);
  value.setUTCHours(0, 0, 0, 0);
  return value;
};

const endOfDayUtc = (date: Date) => {
  const value = new Date(date);
  value.setUTCHours(23, 59, 59, 999);
  return value;
};

const parseDate = (value: string | undefined) => {
  if (!value) return null;
  const [yearString, monthString, dayString] = value.split("-");
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);

  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new ProgressError(
      400,
      "progress:invalid_date_format",
      "유효한 날짜 형식이 아닙니다.",
    );
  }

  return parsed;
};

const dailyProgress = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...dailyProgressRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const query = c.req.valid("query");

      const requestedEnd = parseDate(query.end) ?? new Date();
      const requestedStart =
        parseDate(query.start) ??
        (() => {
          const fallback = new Date(requestedEnd);
          fallback.setUTCDate(fallback.getUTCDate() - (DEFAULT_WINDOW_DAYS - 1));
          return fallback;
        })();

      if (requestedStart > requestedEnd) {
        throw new ProgressError(
          400,
          "progress:invalid_date_range",
          "시작 날짜는 종료 날짜보다 늦을 수 없습니다.",
        );
      }

      const startBoundary = startOfDayUtc(requestedStart);
      const endBoundary = endOfDayUtc(requestedEnd);

      type ActivityAccumulator = {
        due: Array<{
          roadmapId: string;
          roadmapTitle: string;
          goalId: string;
          goalTitle: string;
          subGoalId: string;
          subGoalTitle: string;
          dueDate: string;
        }>;
        completed: Array<{
          roadmapId: string;
          roadmapTitle: string;
          goalId: string;
          goalTitle: string;
          subGoalId: string;
          subGoalTitle: string;
          completedAt: string;
        }>;
      };

      const ensureActivityBucket = (
        map: Map<string, ActivityAccumulator>,
        key: string,
      ) => {
        if (!map.has(key)) {
          map.set(key, { due: [], completed: [] });
        }
        return map.get(key)!;
      };

      const activityByDate = new Map<string, ActivityAccumulator>();

      const completedRows = await db
        .select({
          completedAt: subGoal.completedAt,
          roadmapPublicId: roadmap.publicId,
          roadmapTitle: roadmap.title,
          goalPublicId: goal.publicId,
          goalTitle: goal.title,
          subGoalPublicId: subGoal.publicId,
          subGoalTitle: subGoal.title,
        })
        .from(subGoal)
        .innerJoin(goal, eq(goal.id, subGoal.goalId))
        .innerJoin(roadmap, eq(roadmap.id, goal.roadmapId))
        .where(
          and(
            eq(roadmap.userId, auth.user.id),
            isNotNull(subGoal.completedAt),
            gte(subGoal.completedAt, startBoundary),
            lte(subGoal.completedAt, endBoundary),
          ),
        )
        .orderBy(asc(subGoal.completedAt));

      for (const row of completedRows) {
        if (!row.completedAt) continue;
        const dateKey = toIsoDate(row.completedAt);
        const bucket = ensureActivityBucket(activityByDate, dateKey);
        bucket.completed.push({
          roadmapId: row.roadmapPublicId,
          roadmapTitle: row.roadmapTitle,
          goalId: row.goalPublicId,
          goalTitle: row.goalTitle,
          subGoalId: row.subGoalPublicId,
          subGoalTitle: row.subGoalTitle,
          completedAt: row.completedAt.toISOString(),
        });
      }

      const dueRows = await db
        .select({
          dueDate: subGoal.dueDate,
          roadmapPublicId: roadmap.publicId,
          roadmapTitle: roadmap.title,
          goalPublicId: goal.publicId,
          goalTitle: goal.title,
          subGoalPublicId: subGoal.publicId,
          subGoalTitle: subGoal.title,
        })
        .from(subGoal)
        .innerJoin(goal, eq(goal.id, subGoal.goalId))
        .innerJoin(roadmap, eq(roadmap.id, goal.roadmapId))
        .where(
          and(
            eq(roadmap.userId, auth.user.id),
            isNotNull(subGoal.dueDate),
            eq(subGoal.isCompleted, false),
            gte(subGoal.dueDate, startBoundary),
            lte(subGoal.dueDate, endBoundary),
          ),
        )
        .orderBy(asc(subGoal.dueDate));

      for (const row of dueRows) {
        if (!row.dueDate) continue;
        const dateKey = toIsoDate(row.dueDate);
        const bucket = ensureActivityBucket(activityByDate, dateKey);
        bucket.due.push({
          roadmapId: row.roadmapPublicId,
          roadmapTitle: row.roadmapTitle,
          goalId: row.goalPublicId,
          goalTitle: row.goalTitle,
          subGoalId: row.subGoalPublicId,
          subGoalTitle: row.subGoalTitle,
          dueDate: row.dueDate.toISOString(),
        });
      }

      const items = Array.from(activityByDate.entries())
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([date, activity]) => ({
          date,
          due: activity.due,
          completed: activity.completed,
        }));

      return c.json(
        {
          range: {
            start: toIsoDate(startBoundary),
            end: toIsoDate(endBoundary),
          },
          items,
        },
        status.OK,
      );
    } catch (error) {
      if (error instanceof ProgressError) {
        throw error;
      }

      console.error("Daily goal activity aggregation error:", error);
      throw new ProgressError(
        500,
        "progress:internal_error",
        "목표 활동 현황을 불러오는 도중 오류가 발생했습니다.",
      );
    }
  },
);

export default dailyProgress;
