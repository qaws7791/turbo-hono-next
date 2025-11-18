import { randomUUID } from "crypto";

import {
  convertToModelMessages,
  createUIMessageStream,
  stepCountIs,
  streamText,
} from "ai";

import { geminiModel } from "../../../external/ai/provider";
import { log } from "../../../lib/logger";
import { convertToUIMessages } from "../helpers/message.helper";
import { composeSystemPrompt } from "../helpers/prompt.helper";
import { createTools } from "../tools/create-tools";

import { learningPlanContextService } from "./learning-plan-context.service";
import { messageCommandService } from "./message-command.service";
import { messageQueryService } from "./message-query.service";

import type { AppUIMessage } from "@repo/ai-types";

export interface StreamMessageInput {
  conversationId: string;
  userId: string;
  messages: Array<AppUIMessage>;
  learningPlanId: number;
}

/**
 * Service for AI message streaming
 */
export class AIStreamService {
  /**
   * Create a message stream for AI chat
   */
  async createMessageStream(
    input: StreamMessageInput,
  ): Promise<ReturnType<typeof createUIMessageStream>> {
    const { conversationId, userId, messages, learningPlanId } = input;

    // Build learning plan context
    const planContext = await learningPlanContextService.buildContext(
      learningPlanId,
      userId,
    );

    const systemPrompt = composeSystemPrompt(planContext.planContext);

    // Get message history (last 20 messages)
    const messagesFromDB = await messageQueryService.getLatestMessages(
      conversationId,
      userId,
      20,
    );

    // Save new user messages
    const savedMessages = await messageCommandService.saveMessages({
      conversationId,
      userId,
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        parts: msg.parts,
        attachments: [],
        createdAt: new Date(),
      })),
    });

    // Combine all messages for AI context
    const uiMessages: Array<AppUIMessage> = [
      ...convertToUIMessages(messagesFromDB),
      ...savedMessages.map((msg) => ({
        id: msg.id,
        role: msg.role as AppUIMessage["role"],
        parts: msg.parts as AppUIMessage["parts"],
        attachments: [],
        createdAt: msg.createdAt,
      })),
    ];

    // Create UI message stream
    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const result = streamText({
          model: geminiModel,
          system: systemPrompt,
          messages: convertToModelMessages(uiMessages),
          stopWhen: stepCountIs(5),
          tools: createTools(userId, planContext.learningPlan.id),
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          }),
        );
      },
      generateId: randomUUID,
      onFinish: async ({ messages: finishedMessages }) => {
        await messageCommandService.saveMessages({
          conversationId,
          userId,
          messages: finishedMessages.map((currentMessage) => ({
            id: currentMessage.id,
            role: currentMessage.role,
            parts: currentMessage.parts,
            createdAt: new Date(),
            attachments: [],
          })),
        });

        log.info("AI message stream finished", {
          conversationId,
          messageCount: finishedMessages.length,
        });
      },
      onError: (error) => {
        log.error("AI stream error", {
          error: error instanceof Error ? error.message : "Unknown error",
          conversationId,
          userId,
        });
        return "Oops, an error occurred!";
      },
    });

    return stream;
  }
}

export const aiStreamService = new AIStreamService();
