import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { learningPlanStatusRoute } from "@repo/api-spec/modules/learning-plan/routes/status";

import { authMiddleware } from "../../../middleware/auth";
import { learningPlanCommandService } from "../services/learning-plan.command.service";

import type { AuthContext } from "../../../middleware/auth";

const changeStatus = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...learningPlanStatusRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const { id } = c.req.valid("param");
    const { status: newStatus } = c.req.valid("json");

    const result = await learningPlanCommandService.updateLearningPlanStatus({
      publicId: id,
      userId: auth.user.id,
      status: newStatus,
    });

    return c.json(result, status.OK);
  },
);

export default changeStatus;
