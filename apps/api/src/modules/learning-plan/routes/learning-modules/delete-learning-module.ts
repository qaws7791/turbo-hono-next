import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { deleteLearningModuleRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-modules/delete-learning-module";

import { authMiddleware } from "../../../../middleware/auth";
import { learningModuleService } from "../../services/learning-module.service";

import type { AuthContext } from "../../../../middleware/auth";

const deleteLearningModule = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...deleteLearningModuleRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const { learningPlanId, learningModuleId } = c.req.valid("param");

    const result = await learningModuleService.deleteModule({
      userId: auth.user.id,
      learningPlanId,
      learningModuleId,
    });

    return c.json(result, status.OK);
  },
);

export default deleteLearningModule;
