import { log } from "../../../lib/logger";
import { conversationRepository } from "../repositories/conversation.repository";

import type { AIConversation } from "@repo/database/types";
import type { DatabaseTransaction } from "../../../lib/transaction.helper";

/**
 * Input for getting conversations by learning plan
 */
export interface GetConversationsByPlanInput {
  learningPlanId: number;
  userId: string;
  limit?: number;
}

/**
 * Response for conversation list
 */
export interface ConversationListResponse {
  conversations: Array<{
    id: string;
    learningPlanId: number;
    userId: string;
    title: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  totalCount: number;
}

/**
 * Query service for AI conversation operations
 */
export class ConversationQueryService {
  /**
   * Get a conversation by ID
   */
  async getConversation(
    conversationId: string,
    userId: string,
    tx?: DatabaseTransaction,
  ): Promise<AIConversation> {
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

    return conversation;
  }

  /**
   * Get all conversations for a learning plan
   */
  async getConversationsByPlan(
    input: GetConversationsByPlanInput,
    tx?: DatabaseTransaction,
  ): Promise<ConversationListResponse> {
    const { learningPlanId, userId, limit = 50 } = input;

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

    const conversations = await conversationRepository.findByLearningPlan(
      {
        learningPlanId,
        userId,
        limit,
      },
      tx,
    );

    const totalCount = await conversationRepository.countByLearningPlan(
      learningPlanId,
      userId,
      tx,
    );

    return {
      conversations: conversations.map((conv) => ({
        id: conv.id,
        learningPlanId: conv.learningPlanId,
        userId: conv.userId,
        title: conv.title,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
      })),
      totalCount,
    };
  }

  /**
   * Check if user owns a conversation
   */
  async verifyOwnership(
    conversationId: string,
    userId: string,
    tx?: DatabaseTransaction,
  ): Promise<boolean> {
    const conversation = await conversationRepository.findByIdAndUserId(
      conversationId,
      userId,
      tx,
    );

    return !!conversation;
  }
}

export const conversationQueryService = new ConversationQueryService();
