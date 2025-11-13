import { aiMessage } from "@repo/database/schema";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "../../../database/client";

import type { AIMessage, NewAIMessage } from "@repo/database/types";
import type { DatabaseTransaction } from "../../../lib/transaction.helper";

/**
 * Options for finding messages
 */
export interface FindMessagesOptions {
  conversationId: string;
  limit?: number;
  order?: "asc" | "desc";
}

/**
 * Repository for AI message operations
 */
export class MessageRepository {
  /**
   * Create a new message
   */
  async create(
    data: NewAIMessage,
    tx?: DatabaseTransaction,
  ): Promise<AIMessage> {
    const executor = tx ?? db;

    const [message] = await executor.insert(aiMessage).values(data).returning();

    if (!message) {
      throw new Error("Failed to create message");
    }

    return message;
  }

  /**
   * Create multiple messages in a single transaction
   */
  async createMany(
    data: Array<NewAIMessage>,
    tx?: DatabaseTransaction,
  ): Promise<Array<AIMessage>> {
    const executor = tx ?? db;

    const messages = await executor.insert(aiMessage).values(data).returning();

    return messages;
  }

  /**
   * Find a message by ID
   */
  async findById(
    id: string,
    tx?: DatabaseTransaction,
  ): Promise<AIMessage | null> {
    const executor = tx ?? db;

    const [message] = await executor
      .select()
      .from(aiMessage)
      .where(eq(aiMessage.id, id))
      .limit(1);

    return message ?? null;
  }

  /**
   * Find all messages for a conversation
   */
  async findByConversation(
    options: FindMessagesOptions,
    tx?: DatabaseTransaction,
  ): Promise<Array<AIMessage>> {
    const executor = tx ?? db;

    const orderFn = options.order === "desc" ? desc : asc;

    const messages = await executor
      .select()
      .from(aiMessage)
      .where(eq(aiMessage.conversationId, options.conversationId))
      .orderBy(orderFn(aiMessage.createdAt))
      .limit(options.limit ?? 100);

    return messages;
  }

  /**
   * Count messages for a conversation
   */
  async countByConversation(
    conversationId: string,
    tx?: DatabaseTransaction,
  ): Promise<number> {
    const executor = tx ?? db;

    const result = await executor
      .select({ count: eq(aiMessage.id, aiMessage.id) })
      .from(aiMessage)
      .where(eq(aiMessage.conversationId, conversationId));

    return result.length;
  }

  /**
   * Find the latest N messages for a conversation (for context)
   */
  async findLatestMessages(
    conversationId: string,
    limit: number,
    tx?: DatabaseTransaction,
  ): Promise<Array<AIMessage>> {
    const executor = tx ?? db;

    // Get latest messages in descending order
    const messages = await executor
      .select()
      .from(aiMessage)
      .where(eq(aiMessage.conversationId, conversationId))
      .orderBy(desc(aiMessage.createdAt))
      .limit(limit);

    // Reverse to get chronological order (oldest to newest)
    return messages.reverse();
  }

  /**
   * Delete all messages for a conversation
   */
  async deleteByConversation(
    conversationId: string,
    tx?: DatabaseTransaction,
  ): Promise<void> {
    const executor = tx ?? db;

    await executor
      .delete(aiMessage)
      .where(eq(aiMessage.conversationId, conversationId));
  }

  /**
   * Delete a single message
   */
  async delete(id: string, tx?: DatabaseTransaction): Promise<void> {
    const executor = tx ?? db;

    await executor.delete(aiMessage).where(eq(aiMessage.id, id));
  }
}

export const messageRepository = new MessageRepository();
