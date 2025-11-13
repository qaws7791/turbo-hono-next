/**
 * AI 채팅 섹션 컴포넌트
 * 학습 계획 상세 페이지에서 사용되는 AI 튜터 채팅 UI
 */

import { ChatContainer, ConversationList } from "@repo/ui/ai";
import { useState } from "react";

import { useConversations, useMessages, useStreamMessage } from "../hooks";

import type { Message } from "@repo/ui/ai";

export interface AIChatSectionProps {
  learningPlanId: string;
  className?: string;
}

/**
 * AI 채팅 섹션
 * 대화 세션 목록과 채팅 컨테이너를 포함
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

  // 대화 세션이 로드되면 첫 번째 대화 선택
  if (
    !isLoadingConversations &&
    conversations.length > 0 &&
    !selectedConversationId
  ) {
    setSelectedConversationId(conversations[0]?.id ?? null);
  }

  // 메시지 조회
  const { messages, isLoading: isLoadingMessages } = useMessages(
    selectedConversationId,
  );

  // 스트리밍 메시지 전송
  const { sendMessage, isStreaming } = useStreamMessage();

  // 로컬 메시지 상태 (스트리밍 중 UI 업데이트용)
  const [localMessages, setLocalMessages] = useState<Array<Message>>([]);
  const [streamingText, setStreamingText] = useState("");

  // 메시지 전송 핸들러
  const handleSendMessage = async (content: string) => {
    // 사용자 메시지 즉시 표시
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversationId || "",
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, userMessage]);

    // AI 응답 스트리밍
    await sendMessage(
      {
        conversationId: selectedConversationId ?? undefined,
        learningPlanId,
        message: content,
      },
      {
        onTextChunk: (chunk) => {
          setStreamingText((prev) => prev + chunk);
        },
        onToolCall: (toolName, args) => {
          console.log(`Tool called: ${toolName}`, args);
        },
        onToolResult: (toolName, result) => {
          console.log(`Tool result: ${toolName}`, result);
        },
        onComplete: () => {
          // 스트리밍 완료 후 상태 초기화
          setStreamingText("");
          setLocalMessages([]);
          // 메시지 목록 새로고침은 use-stream-message.ts에서 처리됨
        },
        onError: (error) => {
          console.error("스트리밍 에러:", error);
          setStreamingText("");
          setLocalMessages([]);
        },
      },
    );
  };

  // 새 대화 생성 핸들러
  const handleCreateConversation = async () => {
    try {
      const newConversation = await createConversation({
        learningPlanId,
      });
      setSelectedConversationId(newConversation.id);
    } catch (error) {
      console.error("대화 생성 실패:", error);
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
      console.error("대화 삭제 실패:", error);
    }
  };

  // 표시할 메시지 (실제 메시지 + 로컬 메시지 + 스트리밍 중인 메시지)
  const displayMessages: Array<Message> = [
    ...messages,
    ...localMessages,
    ...(streamingText
      ? [
          {
            id: "streaming",
            conversationId: selectedConversationId || "",
            role: "assistant" as const,
            content: streamingText,
            createdAt: new Date().toISOString(),
          },
        ]
      : []),
  ];

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* 대화 세션 목록 */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-[300px]">
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
          onCreateNew={handleCreateConversation}
          onDelete={handleDeleteConversation}
        />
      </div>

      {/* 채팅 컨테이너 */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-[600px]">
        {selectedConversationId ? (
          <ChatContainer
            messages={displayMessages}
            isLoading={isLoadingMessages}
            isStreaming={isStreaming}
            onSendMessage={handleSendMessage}
            conversationId={selectedConversationId}
            learningPlanId={learningPlanId}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
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
