import { aiConversation, learningPlan } from "@repo/database/schema";
import { and, desc, eq } from "drizzle-orm";

import { db } from "../../../database/client";

import type { AIConversation, NewAIConversation } from "@repo/database/types";
import type { DatabaseTransaction } from "../../../lib/transaction.helper";

/**
 * Options for finding conversations
 */
export interface FindConversationsOptions {
  learningPlanId: number;
  userId: string;
  limit?: number;
}

/**
 * Repository for AI conversation operations
 */
export class ConversationRepository {
  /**
   * Create a new conversation
   */
  async create(
    data: NewAIConversation,
    tx?: DatabaseTransaction,
  ): Promise<AIConversation> {
    const executor = tx ?? db;

    const [conversation] = await executor
      .insert(aiConversation)
      .values(data)
      .returning();

    if (!conversation) {
      throw new Error("Failed to create conversation");
    }

    return conversation;
  }

  /**
   * Find a conversation by ID
   */
  async findById(
    id: string,
    tx?: DatabaseTransaction,
  ): Promise<AIConversation | null> {
    const executor = tx ?? db;

    const [conversation] = await executor
      .select()
      .from(aiConversation)
      .where(eq(aiConversation.id, id))
      .limit(1);

    return conversation ?? null;
  }

  /**
   * Find a conversation by ID with user ownership verification
   */
  async findByIdAndUserId(
    id: string,
    userId: string,
    tx?: DatabaseTransaction,
  ): Promise<AIConversation | null> {
    const executor = tx ?? db;

    const [conversation] = await executor
      .select()
      .from(aiConversation)
      .where(and(eq(aiConversation.id, id), eq(aiConversation.userId, userId)))
      .limit(1);

    return conversation ?? null;
  }

  /**
   * Find all conversations for a learning plan
   */
  async findByLearningPlan(
    options: FindConversationsOptions,
    tx?: DatabaseTransaction,
  ): Promise<Array<AIConversation>> {
    const executor = tx ?? db;

    const conversations = await executor
      .select()
      .from(aiConversation)
      .where(
        and(
          eq(aiConversation.learningPlanId, options.learningPlanId),
          eq(aiConversation.userId, options.userId),
        ),
      )
      .orderBy(desc(aiConversation.updatedAt))
      .limit(options.limit ?? 50);

    return conversations;
  }

  /**
   * Count conversations for a learning plan
   */
  async countByLearningPlan(
    learningPlanId: number,
    userId: string,
    tx?: DatabaseTransaction,
  ): Promise<number> {
    const executor = tx ?? db;

    const result = await executor
      .select({ count: eq(aiConversation.id, aiConversation.id) })
      .from(aiConversation)
      .where(
        and(
          eq(aiConversation.learningPlanId, learningPlanId),
          eq(aiConversation.userId, userId),
        ),
      );

    return result.length;
  }

  /**
   * Update conversation timestamp
   */
  async updateTimestamp(
    id: string,
    tx?: DatabaseTransaction,
  ): Promise<AIConversation> {
    const executor = tx ?? db;

    const [conversation] = await executor
      .update(aiConversation)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(aiConversation.id, id))
      .returning();

    if (!conversation) {
      throw new Error("Failed to update conversation timestamp");
    }

    return conversation;
  }

  /**
   * Update conversation title
   */
  async updateTitle(
    id: string,
    title: string,
    tx?: DatabaseTransaction,
  ): Promise<AIConversation> {
    const executor = tx ?? db;

    const [conversation] = await executor
      .update(aiConversation)
      .set({
        title,
        updatedAt: new Date(),
      })
      .where(eq(aiConversation.id, id))
      .returning();

    if (!conversation) {
      throw new Error("Failed to update conversation title");
    }

    return conversation;
  }

  /**
   * Delete a conversation
   */
  async delete(id: string, tx?: DatabaseTransaction): Promise<void> {
    const executor = tx ?? db;

    await executor.delete(aiConversation).where(eq(aiConversation.id, id));
  }

  /**
   * Verify learning plan ownership
   */
  async verifyLearningPlanOwnership(
    learningPlanId: number,
    userId: string,
    tx?: DatabaseTransaction,
  ): Promise<boolean> {
    const executor = tx ?? db;

    const [plan] = await executor
      .select({ id: learningPlan.id })
      .from(learningPlan)
      .where(
        and(
          eq(learningPlan.id, learningPlanId),
          eq(learningPlan.userId, userId),
        ),
      )
      .limit(1);

    return !!plan;
  }
}

export const conversationRepository = new ConversationRepository();
