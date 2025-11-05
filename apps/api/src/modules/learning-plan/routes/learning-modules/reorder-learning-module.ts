import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { reorderLearningModuleRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-modules/reorder-learning-module";

import { authMiddleware } from "../../../../middleware/auth";
import { learningModuleCommandService } from "../../services/learning-module.command.service";

import type { AuthContext } from "../../../../middleware/auth";

const reorderLearningModule = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...reorderLearningModuleRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const { id } = c.req.valid("param");
    const { newOrder } = c.req.valid("json");

    const result = await learningModuleCommandService.reorderModule({
      userId: auth.user.id,
      learningModuleId: id,
      newOrder,
    });

    return c.json(result, status.OK);
  },
);

export default reorderLearningModule;
