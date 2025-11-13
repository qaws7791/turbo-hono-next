import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { deleteConversationRoute } from "@repo/api-spec";

import { authMiddleware } from "../../../middleware/auth";
import { conversationCommandService } from "../services/conversation-command.service";

import type { AuthContext } from "../../../middleware/auth";

const deleteConversation = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...deleteConversationRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const params = c.req.valid("param");

    await conversationCommandService.deleteConversation(
      params.conversationId,
      auth.user.id,
    );

    return c.body(null, status.NO_CONTENT);
  },
);

export default deleteConversation;
