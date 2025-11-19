import { OpenAPIHono } from "@hono/zod-openapi";
import { deleteLearningModuleRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-modules/delete-learning-module";
import status from "http-status";

import { extractAuthContext } from "../../../../lib/auth-context.helper";
import { authMiddleware } from "../../../../middleware/auth";
import { learningModuleCommandService } from "../../services/learning-module.command.service";

const deleteLearningModule = new OpenAPIHono().openapi(
  {
    ...deleteLearningModuleRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const { id } = c.req.valid("param");

    const result = await learningModuleCommandService.deleteModule({
      userId,
      learningModuleId: id,
    });

    return c.json(result, status.OK);
  },
);

export default deleteLearningModule;
