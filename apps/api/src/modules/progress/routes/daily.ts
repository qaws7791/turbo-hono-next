import { OpenAPIHono } from "@hono/zod-openapi";
import { dailyProgressRoute } from "@repo/api-spec/modules/progress/routes";
import status from "http-status";

import { extractAuthContext } from "../../../lib/auth-context.helper";
import { log } from "../../../lib/logger";
import { authMiddleware } from "../../../middleware/auth";
import { ProgressErrors } from "../errors";
import { progressService } from "../services/progress.service";

const dailyProgress = new OpenAPIHono().openapi(
  {
    ...dailyProgressRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const { userId } = extractAuthContext(c);
      const query = c.req.valid("query");

      // Get daily progress via service
      const result = await progressService.getDailyProgress({
        userId,
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
