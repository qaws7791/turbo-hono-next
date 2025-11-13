import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { createConversationRoute } from "@repo/api-spec";

import { authMiddleware } from "../../../middleware/auth";
import { conversationCommandService } from "../services/conversation-command.service";

import type { AuthContext } from "../../../middleware/auth";

const createConversation = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...createConversationRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const body = c.req.valid("json");

    const conversation = await conversationCommandService.createConversation({
      learningPlanId: body.learningPlanId,
      userId: auth.user.id,
      title: body.title,
    });

    return c.json(
      {
        id: conversation.id,
        learningPlanId: conversation.learningPlanId,
        userId: conversation.userId,
        title: conversation.title,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
      },
      status.CREATED,
    );
  },
);

export default createConversation;
