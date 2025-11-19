import { OpenAPIHono } from "@hono/zod-openapi";
import { deleteConversationRoute } from "@repo/api-spec";
import status from "http-status";

import { extractAuthContext } from "../../../lib/auth-context.helper";
import { authMiddleware } from "../../../middleware/auth";
import { conversationCommandService } from "../services/conversation-command.service";

const deleteConversation = new OpenAPIHono().openapi(
  {
    ...deleteConversationRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const params = c.req.valid("param");

    await conversationCommandService.deleteConversation(
      params.conversationId,
      userId,
    );

    return c.body(null, status.NO_CONTENT);
  },
);

export default deleteConversation;
