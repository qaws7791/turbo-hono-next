import { OpenAPIHono } from "@hono/zod-openapi";
import { streamMessageRoute } from "@repo/api-spec";
import { createUIMessageStreamResponse } from "ai";
import status from "http-status";

import { log } from "../../../lib/logger";
import { authMiddleware } from "../../../middleware/auth";
import { aiStreamService } from "../services/ai-stream.service";
import { conversationQueryService } from "../services/conversation-query.service";

import type { AppUIMessage } from "@repo/ai-types";
import type { AuthContext } from "../../../middleware/auth";

const streamMessage = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...streamMessageRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const body = c.req.valid("json");
    const conversationId = body.conversationId as string;
    const messages = body.messages as Array<AppUIMessage>;
    const userId = auth.user.id;

    log.info("streamMessage", { auth, body });

    if (!conversationId) {
      return c.json(
        { error: "conversationId is required for new conversations" },
        status.BAD_REQUEST,
      );
    }

    try {
      // Get conversation and verify ownership
      const conversation = await conversationQueryService.getConversation(
        conversationId,
        userId,
      );

      // Create AI message stream
      const stream = await aiStreamService.createMessageStream({
        conversationId: conversation.id,
        userId,
        messages,
        learningPlanId: conversation.learningPlanId,
      });

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
