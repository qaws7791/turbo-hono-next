/**
 * 채팅 컨테이너 컴포넌트
 */

import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";

import type { Message } from "./types";

export interface ChatContainerProps {
  messages: Array<Message>;
  isLoading?: boolean;
  isStreaming?: boolean;
  onSendMessage: (message: string) => void;
  conversationId: string | null;
  learningPlanId: string;
  className?: string;
}

/**
 * 메시지 목록과 입력창을 포함하는 채팅 컨테이너
 */
export function ChatContainer({
  messages,
  isLoading = false,
  isStreaming = false,
  onSendMessage,
  conversationId,
  learningPlanId,
  className = "",
}: ChatContainerProps) {
  const handleSend = (content: string) => {
    if (conversationId || learningPlanId) {
      onSendMessage(content);
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}
    >
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          AI 튜터
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          학습 계획에 대해 질문하고 조언을 받아보세요
        </p>
      </div>

      {/* 메시지 목록 */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
      />

      {/* 메시지 입력창 */}
      <MessageInput
        onSend={handleSend}
        disabled={isStreaming}
        placeholder={
          isStreaming
            ? "AI가 응답하는 중입니다..."
            : "AI 튜터에게 질문하세요..."
        }
      />
    </div>
  );
}
