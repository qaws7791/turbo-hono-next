import { OpenAPIHono } from "@hono/zod-openapi";
import { getConversationsRoute } from "@repo/api-spec";
import status from "http-status";

import { authMiddleware } from "../../../middleware/auth";
import { learningPlanRepository } from "../../learning-plan/repositories/learning-plan.repository";
import { conversationQueryService } from "../services/conversation-query.service";
import { AIChatErrors } from "../errors";

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

    // Public ID → Internal ID 변환
    const learningPlan = await learningPlanRepository.findByPublicId(
      query.learningPlanId,
      auth.user.id,
    );

    if (!learningPlan) {
      throw AIChatErrors.learningPlanNotFound();
    }

    const response = await conversationQueryService.getConversationsByPlan({
      learningPlanId: learningPlan.id,
      learningPlanPublicId: learningPlan.publicId,
      userId: auth.user.id,
    });

    return c.json(response, status.OK);
  },
);

export default getConversations;
