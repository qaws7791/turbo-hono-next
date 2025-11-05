import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { createLearningModuleRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-modules/create-learning-module";

import { authMiddleware } from "../../../../middleware/auth";
import { learningModuleCommandService } from "../../services/learning-module.command.service";

import type { AuthContext } from "../../../../middleware/auth";

const createLearningModule = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...createLearningModuleRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const module = await learningModuleCommandService.createModule({
      userId: auth.user.id,
      learningPlanId: id,
      title: body.title,
      description: body.description,
      isExpanded: body.isExpanded,
    });

    return c.json(module, status.CREATED);
  },
);

export default createLearningModule;
