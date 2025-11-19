import { OpenAPIHono } from "@hono/zod-openapi";
import { learningPlanStatusRoute } from "@repo/api-spec/modules/learning-plan/routes/status";
import status from "http-status";

import { extractAuthContext } from "../../../lib/auth-context.helper";
import { authMiddleware } from "../../../middleware/auth";
import { learningPlanCommandService } from "../services/learning-plan.command.service";

const changeStatus = new OpenAPIHono().openapi(
  {
    ...learningPlanStatusRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const { id } = c.req.valid("param");
    const { status: newStatus } = c.req.valid("json");

    const result = await learningPlanCommandService.updateLearningPlanStatus({
      publicId: id,
      userId,
      status: newStatus,
    });

    return c.json(result, status.OK);
  },
);

export default changeStatus;
