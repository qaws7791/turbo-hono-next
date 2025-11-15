import { log } from "../../../lib/logger";
import { conversationRepository } from "../repositories/conversation.repository";
import { messageRepository } from "../repositories/message.repository";

import type { AIMessage } from "@repo/database/types";
import type { DatabaseTransaction } from "../../../lib/transaction.helper";
import type { StoredToolInvocation } from "../types";

/**
 * Input for getting messages
 */
export interface GetMessagesInput {
  conversationId: string;
  userId: string;
  limit?: number;
  order?: "asc" | "desc";
}

/**
 * Response for message list
 */
export interface MessageListResponse {
  messages: Array<{
    id: string;
    conversationId: string;
    role: "user" | "assistant" | "tool";
    content: string;
    toolInvocations?: Array<StoredToolInvocation>;
    createdAt: string;
  }>;
  totalCount: number;
}

/**
 * Query service for AI message operations
 */
export class MessageQueryService {
  /**
   * Get all messages for a conversation
   */
  async getMessages(
    input: GetMessagesInput,
    tx?: DatabaseTransaction,
  ): Promise<MessageListResponse> {
    const { conversationId, userId, limit = 100, order = "asc" } = input;

    // Verify user owns the conversation
    const conversation = await conversationRepository.findByIdAndUserId(
      conversationId,
      userId,
      tx,
    );

    if (!conversation) {
      log.warn("Conversation not found or unauthorized", {
        conversationId,
        userId,
      });
      throw new Error("Conversation not found");
    }

    const messages = await messageRepository.findByConversation(
      {
        conversationId,
        limit,
        order,
      },
      tx,
    );

    const totalCount = await messageRepository.countByConversation(
      conversationId,
      tx,
    );

    return {
      messages: messages.map((msg) => {
        const base = {
          id: msg.id,
          conversationId: msg.conversationId,
          role: msg.role as "user" | "assistant" | "tool",
          content: msg.content,
          createdAt: msg.createdAt.toISOString(),
        };

        if (msg.toolInvocations) {
          return {
            ...base,
            toolInvocations: msg.toolInvocations as Array<StoredToolInvocation>,
          };
        }

        return base;
      }),
      totalCount,
    };
  }

  /**
   * Get the latest N messages for context (for AI)
   */
  async getLatestMessages(
    conversationId: string,
    userId: string,
    limit: number,
    tx?: DatabaseTransaction,
  ): Promise<Array<AIMessage>> {
    // Verify user owns the conversation
    const conversation = await conversationRepository.findByIdAndUserId(
      conversationId,
      userId,
      tx,
    );

    if (!conversation) {
      log.warn("Conversation not found or unauthorized", {
        conversationId,
        userId,
      });
      throw new Error("Conversation not found");
    }

    const messages = await messageRepository.findLatestMessages(
      conversationId,
      limit,
      tx,
    );

    return messages;
  }
}

export const messageQueryService = new MessageQueryService();
