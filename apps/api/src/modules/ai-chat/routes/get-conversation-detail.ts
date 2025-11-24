import { OpenAPIHono } from "@hono/zod-openapi";
import { getConversationDetailRoute } from "@repo/api-spec";
import status from "http-status";

import { extractAuthContext } from "../../../lib/auth-context.helper";
import { authMiddleware } from "../../../middleware/auth";
import { AIChatErrors } from "../errors";
import { conversationQueryService } from "../services/conversation-query.service";

const getConversationDetail = new OpenAPIHono().openapi(
  {
    ...getConversationDetailRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const params = c.req.valid("param");

    try {
      const response =
        await conversationQueryService.getConversationWithMessages(
          params.conversationId,
          userId,
        );

      return c.json(response, status.OK);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Conversation not found"
      ) {
        throw AIChatErrors.conversationNotFound({
          conversationId: params.conversationId,
        });
      }
      throw error;
    }
  },
);

export default getConversationDetail;
