import { useEffect, useState } from "react";

import { useConversations } from "./use-conversations";

import { logger } from "@/shared/utils";

const aiChatLogger = logger.createScoped("AIChatSection");

interface UseConversationManagerReturn {
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conversations: Array<any>;
  isLoadingConversations: boolean;
  handleCreateConversation: () => Promise<void>;
  handleDeleteConversation: (conversationId: string) => Promise<void>;
}

/**
 * AI 대화 세션을 관리하는 훅
 */
export const useConversationManager = (
  learningPlanId: string,
): UseConversationManagerReturn => {
  const {
    conversations,
    isLoading: isLoadingConversations,
    createConversation,
    deleteConversation,
  } = useConversations(learningPlanId);

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(() => conversations[0]?.id ?? null);

  // conversations 변경 시 selectedConversationId 동기화
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
       
      setSelectedConversationId(conversations[0]!.id);
    }
  }, [conversations, selectedConversationId]);

  const handleCreateConversation = async () => {
    try {
      const newConversation = await createConversation({
        learningPlanId,
      });
      setSelectedConversationId(newConversation.id);
    } catch (error) {
      aiChatLogger.error(
        "Failed to create conversation",
        error instanceof Error ? error : new Error(String(error)),
        { learningPlanId },
      );
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);

      // 삭제된 대화가 선택된 대화라면 초기화
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
      }
    } catch (error) {
      aiChatLogger.error(
        "Failed to delete conversation",
        error instanceof Error ? error : new Error(String(error)),
        { conversationId, learningPlanId },
      );
    }
  };

  return {
    selectedConversationId,
    setSelectedConversationId,
    conversations,
    isLoadingConversations,
    handleCreateConversation,
    handleDeleteConversation,
  };
};
