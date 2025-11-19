import { OpenAPIHono } from "@hono/zod-openapi";
import { learningPlanDetailRoute } from "@repo/api-spec/modules/learning-plan/routes/detail";
import status from "http-status";

import { extractAuthContext } from "../../../lib/auth-context.helper";
import { authMiddleware } from "../../../middleware/auth";
import { learningPlanQueryService } from "../services/learning-plan.query.service";

const detail = new OpenAPIHono().openapi(
  {
    ...learningPlanDetailRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const { id } = c.req.valid("param");

    const response = await learningPlanQueryService.getLearningPlan({
      publicId: id,
      userId,
    });

    return c.json(response, status.OK);
  },
);

export default detail;
