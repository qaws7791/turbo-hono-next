import { nanoid } from "nanoid";

import { log } from "../../../lib/logger";
import { conversationRepository } from "../repositories/conversation.repository";

import type { AIConversation } from "@repo/database/types";
import type { DatabaseTransaction } from "../../../lib/transaction.helper";

/**
 * Input for creating a conversation
 */
export interface CreateConversationInput {
  learningPlanId: number;
  userId: string;
  title?: string;
}

/**
 * Command service for AI conversation operations
 */
export class ConversationCommandService {
  /**
   * Create a new conversation
   */
  async createConversation(
    input: CreateConversationInput,
    tx?: DatabaseTransaction,
  ): Promise<AIConversation> {
    const { learningPlanId, userId, title } = input;

    // Verify user owns the learning plan
    const isOwner = await conversationRepository.verifyLearningPlanOwnership(
      learningPlanId,
      userId,
      tx,
    );

    if (!isOwner) {
      log.warn("Unauthorized access to learning plan", {
        learningPlanId,
        userId,
      });
      throw new Error(
        "You do not have permission to access this learning plan",
      );
    }

    // Generate unique conversation ID
    const conversationId = `conv_${nanoid(16)}`;

    const conversation = await conversationRepository.create(
      {
        id: conversationId,
        learningPlanId,
        userId,
        title: title ?? "새 대화",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      tx,
    );

    log.info("Conversation created", {
      conversationId: conversation.id,
      learningPlanId,
      userId,
    });

    return conversation;
  }

  /**
   * Update conversation timestamp (for marking as recently active)
   */
  async updateConversationTimestamp(
    conversationId: string,
    userId: string,
    tx?: DatabaseTransaction,
  ): Promise<AIConversation> {
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

    const updated = await conversationRepository.updateTimestamp(
      conversationId,
      tx,
    );

    log.debug("Conversation timestamp updated", {
      conversationId,
    });

    return updated;
  }

  /**
   * Update conversation title
   */
  async updateConversationTitle(
    conversationId: string,
    userId: string,
    title: string,
    tx?: DatabaseTransaction,
  ): Promise<AIConversation> {
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

    const updated = await conversationRepository.updateTitle(
      conversationId,
      title,
      tx,
    );

    log.info("Conversation title updated", {
      conversationId,
      title,
    });

    return updated;
  }

  /**
   * Delete a conversation and all its messages
   */
  async deleteConversation(
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

    await conversationRepository.delete(conversationId, tx);

    log.info("Conversation deleted", {
      conversationId,
      userId,
    });
  }
}

export const conversationCommandService = new ConversationCommandService();
