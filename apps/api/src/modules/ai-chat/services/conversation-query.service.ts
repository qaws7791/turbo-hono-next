import { log } from "../../../lib/logger";
import { conversationRepository } from "../repositories/conversation.repository";

import type { AIConversation } from "@repo/database/types";
import type { DatabaseTransaction } from "../../../lib/transaction.helper";

/**
 * Input for getting conversations by learning plan
 */
export interface GetConversationsByPlanInput {
  learningPlanId: number;
  learningPlanPublicId: string;
  userId: string;
  limit?: number;
}

/**
 * Response for conversation list
 */
export interface ConversationListResponse {
  conversations: Array<{
    id: string;
    learningPlanId: string;
    userId: string;
    title: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  totalCount: number;
}

/**
 * Response for conversation detail with messages
 */
export interface ConversationDetailResponse {
  conversation: {
    id: string;
    learningPlanId: string;
    userId: string;
    title: string | null;
    createdAt: string;
    updatedAt: string;
  };
  messages: Array<{
    id: string;
    conversationId: string;
    role: "user" | "assistant" | "tool";
    parts: Array<unknown>;
    attachments?: Array<unknown>;
    createdAt: string;
  }>;
  totalMessageCount: number;
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
  ): Promise<AIConversation | null> {
    const conversation = await conversationRepository.findByIdAndUserId(
      conversationId,
      userId,
      tx,
    );

    if (!conversation) {
      return null;
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
    const { learningPlanId, learningPlanPublicId, userId, limit = 50 } = input;

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
        learningPlanId: learningPlanPublicId,
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

  /**
   * Get conversation detail with all messages
   */
  async getConversationWithMessages(
    conversationId: string,
    userId: string,
    tx?: DatabaseTransaction,
  ): Promise<ConversationDetailResponse> {
    // Verify ownership and get conversation
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

    // Get learning plan public ID
    const { learningPlanRepository } = await import(
      "../../learning-plan/repositories/learning-plan.repository"
    );
    const learningPlan = await learningPlanRepository.findById(
      conversation.learningPlanId,
      tx,
    );

    if (!learningPlan) {
      log.error("Learning plan not found for conversation", {
        conversationId,
        learningPlanId: conversation.learningPlanId,
      });
      throw new Error("Learning plan not found");
    }

    // Get all messages for this conversation
    const { messageRepository } = await import(
      "../repositories/message.repository"
    );
    const messages = await messageRepository.findByConversation(
      {
        conversationId,
        limit: 1000,
        order: "asc",
      },
      tx,
    );

    const totalMessageCount = await messageRepository.countByConversation(
      conversationId,
      tx,
    );

    return {
      conversation: {
        id: conversation.id,
        learningPlanId: learningPlan.publicId,
        userId: conversation.userId,
        title: conversation.title,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
      },
      messages: messages.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        role: msg.role as "user" | "assistant" | "tool",
        parts: (msg.parts ?? []) as Array<unknown>,
        attachments: (msg.attachments ?? []) as Array<unknown>,
        createdAt: msg.createdAt?.toISOString() ?? new Date().toISOString(),
      })),
      totalMessageCount,
    };
  }
}

export const conversationQueryService = new ConversationQueryService();
