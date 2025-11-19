import { OpenAPIHono } from "@hono/zod-openapi";
import { getLearningTaskNoteRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/get-learning-task-note";
import status from "http-status";

import { extractAuthContext } from "../../../../lib/auth-context.helper";
import { authMiddleware } from "../../../../middleware/auth";
import { getLearningTaskNote } from "../../../ai/services/learning-task-note-service";

const getLearningTaskNoteHandler = new OpenAPIHono().openapi(
  {
    ...getLearningTaskNoteRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const { id } = c.req.valid("param");

    const result = await getLearningTaskNote({
      userId,
      learningTaskPublicId: id,
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
