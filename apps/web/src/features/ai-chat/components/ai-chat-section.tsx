/**
 * AI 채팅 섹션 컴포넌트 (AI SDK v5 useChat 기반)
 * 기본 HTML 엘리먼트만 사용하는 단순화된 UI
 */

import { useState } from "react";

import { useConversations } from "../hooks/use-conversations";

import ChatBot from "@/features/ai-chat/components/chatbot";
import { logger } from "@/shared/utils";

const aiChatLogger = logger.createScoped("AIChatSection");

export interface AIChatSectionProps {
  learningPlanId: string;
  className?: string;
}

/**
 * AI 채팅 섹션
 * AI SDK v5의 useChat 훅을 사용하여 구현
 */
export function AIChatSection({
  learningPlanId,
  className = "",
}: AIChatSectionProps) {
  // 대화 세션 관리
  const {
    conversations,
    isLoading: isLoadingConversations,
    createConversation,
    deleteConversation,
  } = useConversations(learningPlanId);

  // 선택된 대화 세션
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(() => conversations[0]?.id ?? null);

  // 새 대화 생성 핸들러
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

  // 대화 삭제 핸들러
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

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* 대화 세션 목록 */}
      <div className="border border-gray-200 rounded-lg p-4 h-[200px] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">대화 목록</h3>
          <button
            type="button"
            onClick={handleCreateConversation}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
          >
            + 새 대화
          </button>
        </div>

        {isLoadingConversations ? (
          <p className="text-sm text-gray-500">로딩 중...</p>
        ) : conversations.length === 0 ? (
          <p className="text-sm text-gray-500">대화가 없습니다</p>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-2 rounded cursor-pointer flex items-center justify-between ${
                  selectedConversationId === conv.id
                    ? "bg-blue-100"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
                onClick={() => setSelectedConversationId(conv.id)}
              >
                <span className="text-sm truncate flex-1">
                  {conv.title || "새 대화"}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id);
                  }}
                  className="ml-2 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 채팅 컨테이너 */}
      <div className="border border-gray-200 rounded-lg flex flex-col h-[600px]">
        {selectedConversationId ? (
          <ChatBot conversationId={selectedConversationId} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center space-y-4">
              <p className="text-lg font-medium">대화를 시작하세요</p>
              <p className="text-sm">
                새 대화를 생성하거나 기존 대화를 선택해주세요
              </p>
              <button
                type="button"
                onClick={handleCreateConversation}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                + 새 대화 시작
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
