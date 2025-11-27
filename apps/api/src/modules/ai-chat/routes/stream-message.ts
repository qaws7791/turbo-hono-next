import { OpenAPIHono } from "@hono/zod-openapi";
import { streamMessageRoute } from "@repo/api-spec";
import { createUIMessageStreamResponse } from "ai";
import status from "http-status";

import { extractAuthContext } from "../../../lib/auth-context.helper";
import { log } from "../../../lib/logger";
import { authMiddleware } from "../../../middleware/auth";
import { generateConversationTitle } from "../../../external/ai/features/conversation-title/generator";
import { learningPlanRepository } from "../../learning-plan/repositories/learning-plan.repository";
import { AIChatErrors } from "../errors";
import { extractTextFromUIMessage } from "../helpers/message.helper";
import { aiStreamService } from "../services/ai-stream.service";
import { conversationCommandService } from "../services/conversation-command.service";
import { conversationQueryService } from "../services/conversation-query.service";

import type { AppUIMessage } from "@repo/ai-types";
import type { AIConversation } from "@repo/database";

const streamMessage = new OpenAPIHono().openapi(
  {
    ...streamMessageRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const body = c.req.valid("json");
    let conversationId = body.conversationId as string | undefined;
    const message = body.message as AppUIMessage;
    const learningPlanPublicId = body.learningPlanId as string | undefined;

    log.info("streamMessage", { body });

    try {
      let isNewConversation = false;

      if (!learningPlanPublicId) {
        return c.json(
          {
            error: "learningPlanId is required when conversationId is missing",
          },
          status.BAD_REQUEST,
        );
      }

      // Convert public ID to internal ID
      const learningPlan = await learningPlanRepository.findByPublicId(
        learningPlanPublicId,
        userId,
      );

      if (!learningPlan) {
        throw AIChatErrors.learningPlanNotFound();
      }

      let conversation: AIConversation | null = null;

      if (conversationId) {
        conversation = await conversationQueryService.getConversation(
          conversationId,
          userId,
        );
      }

      if (!conversation) {
        // Extract text from user message for title generation
        const userMessageText = extractTextFromUIMessage(message);

        // Generate title from user's first message using AI
        const title = await generateConversationTitle(userMessageText);

        // Create new conversation with AI-generated title
        conversation = await conversationCommandService.createConversation({
          learningPlanId: learningPlan.id,
          userId,
          title,
        });

        isNewConversation = true;

        log.info("New conversation created", {
          conversationId: conversation.id,
          title,
          learningPlanPublicId,
          userId,
        });
      }

      conversationId = conversation.id;
      const learningPlanId = conversation.learningPlanId;

      // Create AI message stream
      const stream = await aiStreamService.createMessageStream({
        conversation,
        userId,
        messages: [message],
        learningPlanId,
        isNewConversation,
      });

      // conversationId는 스트림 metadata로 전달됨 (ai-stream.service.ts의 messageMetadata 참조)

      // Return UI Message Stream Response
      return createUIMessageStreamResponse({
        stream,
      });
    } catch (error) {
      log.error("Failed to stream message", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
        conversationId,
      });

      return c.json(
        {
          error:
            error instanceof Error ? error.message : "Failed to stream message",
        },
        status.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

export default streamMessage;
