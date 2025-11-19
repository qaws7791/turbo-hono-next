import { OpenAPIHono } from "@hono/zod-openapi";
import { createConversationRoute } from "@repo/api-spec";
import status from "http-status";

import { extractAuthContext } from "../../../lib/auth-context.helper";
import { authMiddleware } from "../../../middleware/auth";
import { learningPlanRepository } from "../../learning-plan/repositories/learning-plan.repository";
import { AIChatErrors } from "../errors";
import { conversationCommandService } from "../services/conversation-command.service";

const createConversation = new OpenAPIHono().openapi(
  {
    ...createConversationRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const body = c.req.valid("json");

    // Public ID → Internal ID 변환
    const learningPlan = await learningPlanRepository.findByPublicId(
      body.learningPlanId,
      userId,
    );

    if (!learningPlan) {
      throw AIChatErrors.learningPlanNotFound();
    }

    const conversation = await conversationCommandService.createConversation({
      learningPlanId: learningPlan.id,
      userId,
      title: body.title,
    });

    return c.json(
      {
        id: conversation.id,
        learningPlanId: body.learningPlanId, // Public ID 반환
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
