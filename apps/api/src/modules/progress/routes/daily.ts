import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { dailyProgressRoute } from "@repo/api-spec/modules/progress/routes";

import { log } from "../../../lib/logger";
import { authMiddleware } from "../../../middleware/auth";
import { progressService } from "../services/progress.service";
import { ProgressErrors } from "../errors";

import type { AuthContext } from "../../../middleware/auth";

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

      // Get daily progress via service
      const result = await progressService.getDailyProgress({
        userId: auth.user.id,
        start: query.start,
        end: query.end,
      });

      return c.json(result, status.OK);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        throw error;
      }

      log.error("Daily learning module activity aggregation error", error);
      throw ProgressErrors.internalError({
        message: "Failed to retrieve daily progress",
      });
    }
  },
);

export default dailyProgress;
