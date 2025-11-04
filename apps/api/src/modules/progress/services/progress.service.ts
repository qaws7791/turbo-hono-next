import { and, asc, eq, gte, isNotNull, lte } from "drizzle-orm";
import {
  learningModule,
  learningPlan,
  learningTask,
} from "@repo/database/schema";

import { db } from "../../../database/client";
import { log } from "../../../lib/logger";
import { ProgressError, ProgressErrors } from "../errors";

const DEFAULT_WINDOW_DAYS = 30;

/**
 * Input type for getting daily progress
 */
export interface GetDailyProgressInput {
  userId: string;
  start?: string; // ISO date string (YYYY-MM-DD)
  end?: string; // ISO date string (YYYY-MM-DD)
}

/**
 * Daily progress activity item
 */
interface DailyActivity {
  date: string;
  due: Array<{
    learningPlanId: string;
    learningPlanTitle: string;
    learningModuleId: string;
    learningModuleTitle: string;
    learningTaskId: string;
    learningTaskTitle: string;
    dueDate: string;
  }>;
  completed: Array<{
    learningPlanId: string;
    learningPlanTitle: string;
    learningModuleId: string;
    learningModuleTitle: string;
    learningTaskId: string;
    learningTaskTitle: string;
    completedAt: string;
  }>;
}

/**
 * Daily progress response
 */
export interface DailyProgressResponse {
  range: {
    start: string;
    end: string;
  };
  items: Array<DailyActivity>;
}

/**
 * Activity accumulator for grouping by date
 */
type ActivityAccumulator = {
  due: DailyActivity["due"];
  completed: DailyActivity["completed"];
};

/**
 * Converts Date to ISO date string (YYYY-MM-DD)
 */
const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

/**
 * Returns start of day in UTC
 */
const startOfDayUtc = (date: Date) => {
  const value = new Date(date);
  value.setUTCHours(0, 0, 0, 0);
  return value;
};

/**
 * Returns end of day in UTC
 */
const endOfDayUtc = (date: Date) => {
  const value = new Date(date);
  value.setUTCHours(23, 59, 59, 999);
  return value;
};

/**
 * Parses ISO date string (YYYY-MM-DD) to Date
 */
const parseDate = (value: string | undefined): Date | null => {
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
    throw ProgressErrors.invalidDateFormat();
  }

  return parsed;
};

/**
 * Ensures activity bucket exists in map
 */
const ensureActivityBucket = (
  map: Map<string, ActivityAccumulator>,
  key: string,
): ActivityAccumulator => {
  if (!map.has(key)) {
    map.set(key, { due: [], completed: [] });
  }
  return map.get(key)!;
};

/**
 * Service layer for progress tracking operations.
 * Handles daily progress aggregation and analytics.
 */
export class ProgressService {
  /**
   * Gets daily progress with completed and due tasks
   * @param input - Date range and user ID
   * @returns Daily progress data grouped by date
   */
  async getDailyProgress(
    input: GetDailyProgressInput,
  ): Promise<DailyProgressResponse> {
    try {
      const { userId, start, end } = input;

      // Parse and validate date range
      const requestedEnd = parseDate(end) ?? new Date();
      const requestedStart =
        parseDate(start) ??
        (() => {
          const fallback = new Date(requestedEnd);
          fallback.setUTCDate(
            fallback.getUTCDate() - (DEFAULT_WINDOW_DAYS - 1),
          );
          return fallback;
        })();

      if (requestedStart > requestedEnd) {
        throw ProgressErrors.invalidDateRange({
          message: "Start date cannot be later than end date",
        });
      }

      const startBoundary = startOfDayUtc(requestedStart);
      const endBoundary = endOfDayUtc(requestedEnd);

      // Initialize activity map
      const activityByDate = new Map<string, ActivityAccumulator>();

      // Query completed tasks in date range
      const completedRows = await db
        .select({
          completedAt: learningTask.completedAt,
          learningPlanPublicId: learningPlan.publicId,
          learningPlanTitle: learningPlan.title,
          learningModulePublicId: learningModule.publicId,
          learningModuleTitle: learningModule.title,
          learningTaskPublicId: learningTask.publicId,
          learningTaskTitle: learningTask.title,
        })
        .from(learningTask)
        .innerJoin(
          learningModule,
          eq(learningModule.id, learningTask.learningModuleId),
        )
        .innerJoin(
          learningPlan,
          eq(learningPlan.id, learningModule.learningPlanId),
        )
        .where(
          and(
            eq(learningPlan.userId, userId),
            isNotNull(learningTask.completedAt),
            gte(learningTask.completedAt, startBoundary),
            lte(learningTask.completedAt, endBoundary),
          ),
        )
        .orderBy(asc(learningTask.completedAt));

      // Group completed tasks by date
      for (const row of completedRows) {
        if (!row.completedAt) continue;
        const dateKey = toIsoDate(row.completedAt);
        const bucket = ensureActivityBucket(activityByDate, dateKey);
        bucket.completed.push({
          learningPlanId: row.learningPlanPublicId,
          learningPlanTitle: row.learningPlanTitle,
          learningModuleId: row.learningModulePublicId,
          learningModuleTitle: row.learningModuleTitle,
          learningTaskId: row.learningTaskPublicId,
          learningTaskTitle: row.learningTaskTitle,
          completedAt: row.completedAt.toISOString(),
        });
      }

      // Query due tasks in date range (not completed)
      const dueRows = await db
        .select({
          dueDate: learningTask.dueDate,
          learningPlanPublicId: learningPlan.publicId,
          learningPlanTitle: learningPlan.title,
          learningModulePublicId: learningModule.publicId,
          learningModuleTitle: learningModule.title,
          learningTaskPublicId: learningTask.publicId,
          learningTaskTitle: learningTask.title,
        })
        .from(learningTask)
        .innerJoin(
          learningModule,
          eq(learningModule.id, learningTask.learningModuleId),
        )
        .innerJoin(
          learningPlan,
          eq(learningPlan.id, learningModule.learningPlanId),
        )
        .where(
          and(
            eq(learningPlan.userId, userId),
            isNotNull(learningTask.dueDate),
            eq(learningTask.isCompleted, false),
            gte(learningTask.dueDate, startBoundary),
            lte(learningTask.dueDate, endBoundary),
          ),
        )
        .orderBy(asc(learningTask.dueDate));

      // Group due tasks by date
      for (const row of dueRows) {
        if (!row.dueDate) continue;
        const dateKey = toIsoDate(row.dueDate);
        const bucket = ensureActivityBucket(activityByDate, dateKey);
        bucket.due.push({
          learningPlanId: row.learningPlanPublicId,
          learningPlanTitle: row.learningPlanTitle,
          learningModuleId: row.learningModulePublicId,
          learningModuleTitle: row.learningModuleTitle,
          learningTaskId: row.learningTaskPublicId,
          learningTaskTitle: row.learningTaskTitle,
          dueDate: row.dueDate.toISOString(),
        });
      }

      // Convert map to sorted array
      const items = Array.from(activityByDate.entries())
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([date, activity]) => ({
          date,
          due: activity.due,
          completed: activity.completed,
        }));

      log.info("Daily progress retrieved successfully", {
        userId,
        start: toIsoDate(startBoundary),
        end: toIsoDate(endBoundary),
        daysWithActivity: items.length,
      });

      return {
        range: {
          start: toIsoDate(startBoundary),
          end: toIsoDate(endBoundary),
        },
        items,
      };
    } catch (error) {
      if (error instanceof ProgressError) {
        throw error;
      }

      log.error("Daily progress retrieval failed", error, {
        userId: input.userId,
      });

      throw ProgressErrors.internalError({
        message: "Failed to retrieve daily progress",
      });
    }
  }
}

// Export singleton instance
export const progressService = new ProgressService();
