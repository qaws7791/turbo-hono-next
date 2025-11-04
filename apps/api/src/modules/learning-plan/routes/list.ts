import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { learningPlanListRoute } from "@repo/api-spec/modules/learning-plan/routes/list";

import { authMiddleware } from "../../../middleware/auth";
import { learningPlanQueryService } from "../services/learning-plan.query.service";

import type { AuthContext } from "../../../middleware/auth";

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
    const auth = c.get("auth");
    const query = c.req.valid("query");

    const response = await learningPlanQueryService.listLearningPlans({
      userId: auth.user.id,
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
