import { nanoid } from "nanoid";

import { log } from "../../../lib/logger";
import { conversationRepository } from "../repositories/conversation.repository";
import { messageRepository } from "../repositories/message.repository";

import type { AIMessage } from "@repo/database/types";
import type { DatabaseTransaction } from "../../../lib/transaction.helper";
import type { StoredToolInvocation } from "../types";

/**
 * Input for saving a single message
 */
export interface SaveMessageInput {
  conversationId: string;
  role: "user" | "assistant" | "tool";
  content: string;
  toolInvocations?: Array<StoredToolInvocation>;
  userId: string;
}

/**
 * Input for saving multiple messages
 */
export interface SaveMessagesInput {
  conversationId: string;
  messages: Array<{
    role: "user" | "assistant" | "tool";
    content: string;
    toolInvocations?: Array<StoredToolInvocation>;
  }>;
  userId: string;
}

/**
 * Command service for AI message operations
 */
export class MessageCommandService {
  /**
   * Save a single message
   */
  async saveMessage(
    input: SaveMessageInput,
    tx?: DatabaseTransaction,
  ): Promise<AIMessage> {
    const { conversationId, role, content, toolInvocations, userId } = input;

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

    // Generate unique message ID
    const messageId = `msg_${nanoid(16)}`;

    const message = await messageRepository.create(
      {
        id: messageId,
        conversationId,
        role,
        content,
        toolInvocations: toolInvocations ?? null,
        createdAt: new Date(),
      },
      tx,
    );

    log.debug("Message saved", {
      messageId: message.id,
      conversationId,
      role,
    });

    return message;
  }

  /**
   * Save multiple messages in a single transaction
   */
  async saveMessages(
    input: SaveMessagesInput,
    tx?: DatabaseTransaction,
  ): Promise<Array<AIMessage>> {
    const { conversationId, messages, userId } = input;

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

    const messagesToCreate = messages.map((msg) => ({
      id: `msg_${nanoid(16)}`,
      conversationId,
      role: msg.role,
      content: msg.content,
      toolInvocations: msg.toolInvocations ?? null,
      createdAt: new Date(),
    }));

    const savedMessages = await messageRepository.createMany(
      messagesToCreate,
      tx,
    );

    log.info("Messages saved", {
      conversationId,
      count: savedMessages.length,
    });

    return savedMessages;
  }

  /**
   * Delete all messages for a conversation
   */
  async deleteMessagesByConversation(
    conversationId: string,
    userId: string,
    tx?: DatabaseTransaction,
  ): Promise<void> {
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

    await messageRepository.deleteByConversation(conversationId, tx);

    log.info("Messages deleted", {
      conversationId,
    });
  }
}

export const messageCommandService = new MessageCommandService();
