import { OpenAPIHono } from "@hono/zod-openapi";
import { reorderLearningModuleRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-modules/reorder-learning-module";
import status from "http-status";

import { extractAuthContext } from "../../../../lib/auth-context.helper";
import { authMiddleware } from "../../../../middleware/auth";
import { learningModuleCommandService } from "../../services/learning-module.command.service";

const reorderLearningModule = new OpenAPIHono().openapi(
  {
    ...reorderLearningModuleRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const { id } = c.req.valid("param");
    const { newOrder } = c.req.valid("json");

    const result = await learningModuleCommandService.reorderModule({
      userId,
      learningModuleId: id,
      newOrder,
    });

    return c.json(result, status.OK);
  },
);

export default reorderLearningModule;
