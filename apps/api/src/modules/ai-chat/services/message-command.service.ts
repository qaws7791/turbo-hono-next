import { nanoid } from "nanoid";

import { log } from "../../../lib/logger";
import { conversationRepository } from "../repositories/conversation.repository";
import { messageRepository } from "../repositories/message.repository";

import type { AIMessage, NewAIMessage } from "@repo/database/types";
import type { DatabaseTransaction } from "../../../lib/transaction.helper";

/**
 * Input for saving a single message
 */
export interface SaveMessageInput {
  userId: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  parts: unknown;
  attachments?: unknown;
  createdAt?: Date;
}

/**
 * Input for saving multiple messages
 */
export interface SaveMessagesInput {
  conversationId: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant" | "system";
    parts: unknown;
    attachments?: unknown;
    createdAt?: Date;
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
    const { conversationId, role, parts, attachments, createdAt } = input;

    // Verify user owns the conversation
    const conversation = await conversationRepository.findById(
      conversationId,
      tx,
    );

    if (!conversation) {
      log.warn("Conversation not found", {
        conversationId,
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
        parts,
        attachments,
        createdAt,
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

    const messagesToCreate: Array<NewAIMessage> = messages.map((msg) => ({
      id: `msg_${nanoid(16)}`,
      conversationId,
      role: msg.role,
      parts: msg.parts,
      attachments: msg.attachments,
      createdAt: msg.createdAt || new Date(),
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
