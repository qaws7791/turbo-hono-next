import { OpenAPIHono } from "@hono/zod-openapi";
import { getLearningTaskNoteRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/get-learning-task-note";
import status from "http-status";

import { authMiddleware } from "../../../../middleware/auth";
import { getLearningTaskNote } from "../../../ai/services/learning-task-note-service";

import type { AuthContext } from "../../../../middleware/auth";

const getLearningTaskNoteHandler = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...getLearningTaskNoteRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const { learningPlanId, learningTaskId } = c.req.valid("param");

    const result = await getLearningTaskNote({
      userId: auth.user.id,
      learningPlanPublicId: learningPlanId,
      learningTaskPublicId: learningTaskId,
    });

    return c.json(
      {
        status: result.status,
        markdown: result.markdown,
        requestedAt: result.requestedAt?.toISOString() ?? null,
        completedAt: result.completedAt?.toISOString() ?? null,
        errorMessage: result.errorMessage,
      },
      status.OK,
    );
  },
);

export default getLearningTaskNoteHandler;
