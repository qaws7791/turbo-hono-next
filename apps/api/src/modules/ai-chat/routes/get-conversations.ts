import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { getConversationsRoute } from "@repo/api-spec";

import { authMiddleware } from "../../../middleware/auth";
import { conversationQueryService } from "../services/conversation-query.service";

import type { AuthContext } from "../../../middleware/auth";

const getConversations = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...getConversationsRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const query = c.req.valid("query");

    const response = await conversationQueryService.getConversationsByPlan({
      learningPlanId: query.learningPlanId,
      userId: auth.user.id,
    });

    return c.json(response, status.OK);
  },
);

export default getConversations;
