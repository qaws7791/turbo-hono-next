import { OpenAPIHono } from "@hono/zod-openapi";
import { learningPlanListRoute } from "@repo/api-spec/modules/learning-plan/routes/list";
import status from "http-status";

import { extractAuthContext } from "../../../lib/auth-context.helper";
import { authMiddleware } from "../../../middleware/auth";
import { learningPlanQueryService } from "../services/learning-plan.query.service";

const list = new OpenAPIHono().openapi(
  {
    ...learningPlanListRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const query = c.req.valid("query");

    const response = await learningPlanQueryService.listLearningPlans({
      userId,
      cursor: query.cursor,
      limit: query.limit,
      status: query.status,
      search: query.search,
      sort: query.sort,
      order: query.order,
    });

    return c.json(response, status.OK);
  },
);

export default list;
