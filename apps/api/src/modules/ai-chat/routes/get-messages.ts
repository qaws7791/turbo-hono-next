import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { getMessagesRoute } from "@repo/api-spec";

import { authMiddleware } from "../../../middleware/auth";
import { messageQueryService } from "../services/message-query.service";

import type { AuthContext } from "../../../middleware/auth";

const getMessages = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...getMessagesRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const params = c.req.valid("param");

    const response = await messageQueryService.getMessages({
      conversationId: params.conversationId,
      userId: auth.user.id,
    });

    return c.json(response, status.OK);
  },
);

export default getMessages;
