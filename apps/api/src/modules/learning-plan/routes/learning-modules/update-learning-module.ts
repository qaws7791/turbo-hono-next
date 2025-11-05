import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { updateLearningModuleRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-modules/update-learning-module";

import { authMiddleware } from "../../../../middleware/auth";
import { learningModuleCommandService } from "../../services/learning-module.command.service";

import type { AuthContext } from "../../../../middleware/auth";

const updateLearningModule = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...updateLearningModuleRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const module = await learningModuleCommandService.updateModule({
      userId: auth.user.id,
      learningModuleId: id,
      title: body.title,
      description: body.description,
      isExpanded: body.isExpanded,
    });

    return c.json(module, status.OK);
  },
);

export default updateLearningModule;
