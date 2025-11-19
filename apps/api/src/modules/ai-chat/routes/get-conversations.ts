import { OpenAPIHono } from "@hono/zod-openapi";
import { getConversationsRoute } from "@repo/api-spec";
import status from "http-status";

import { extractAuthContext } from "../../../lib/auth-context.helper";
import { authMiddleware } from "../../../middleware/auth";
import { learningPlanRepository } from "../../learning-plan/repositories/learning-plan.repository";
import { AIChatErrors } from "../errors";
import { conversationQueryService } from "../services/conversation-query.service";

const getConversations = new OpenAPIHono().openapi(
  {
    ...getConversationsRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const query = c.req.valid("query");

    // Public ID → Internal ID 변환
    const learningPlan = await learningPlanRepository.findByPublicId(
      query.learningPlanId,
      userId,
    );

    if (!learningPlan) {
      throw AIChatErrors.learningPlanNotFound();
    }

    const response = await conversationQueryService.getConversationsByPlan({
      learningPlanId: learningPlan.id,
      learningPlanPublicId: learningPlan.publicId,
      userId,
    });

    return c.json(response, status.OK);
  },
);

export default getConversations;
