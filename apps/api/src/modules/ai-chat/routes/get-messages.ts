import { OpenAPIHono } from "@hono/zod-openapi";
import { getMessagesRoute } from "@repo/api-spec";
import status from "http-status";

import { extractAuthContext } from "../../../lib/auth-context.helper";
import { authMiddleware } from "../../../middleware/auth";
import { messageQueryService } from "../services/message-query.service";

const getMessages = new OpenAPIHono().openapi(
  {
    ...getMessagesRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const params = c.req.valid("param");

    const response = await messageQueryService.getMessages({
      conversationId: params.conversationId,
      userId,
    });

    return c.json(response, status.OK);
  },
);

export default getMessages;
