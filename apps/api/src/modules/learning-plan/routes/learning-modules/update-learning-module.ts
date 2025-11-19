import { OpenAPIHono } from "@hono/zod-openapi";
import { updateLearningModuleRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-modules/update-learning-module";
import status from "http-status";

import { extractAuthContext } from "../../../../lib/auth-context.helper";
import { authMiddleware } from "../../../../middleware/auth";
import { learningModuleCommandService } from "../../services/learning-module.command.service";

const updateLearningModule = new OpenAPIHono().openapi(
  {
    ...updateLearningModuleRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const module = await learningModuleCommandService.updateModule({
      userId,
      learningModuleId: id,
      title: body.title,
      description: body.description,
      isExpanded: body.isExpanded,
    });

    return c.json(module, status.OK);
  },
);

export default updateLearningModule;
