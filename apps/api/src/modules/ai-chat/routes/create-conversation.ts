import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { createConversationRoute } from "@repo/api-spec";

import { authMiddleware } from "../../../middleware/auth";
import { learningPlanRepository } from "../../learning-plan/repositories/learning-plan.repository";
import { conversationCommandService } from "../services/conversation-command.service";
import { AIChatErrors } from "../errors";

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

    // Public ID → Internal ID 변환
    const learningPlan = await learningPlanRepository.findByPublicId(
      body.learningPlanId,
      auth.user.id,
    );

    if (!learningPlan) {
      throw AIChatErrors.learningPlanNotFound();
    }

    const conversation = await conversationCommandService.createConversation({
      learningPlanId: learningPlan.id,
      userId: auth.user.id,
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
