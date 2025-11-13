/**
 * 메시지 목록 컴포넌트
 */

import { useEffect, useRef } from "react";

import { MessageItem } from "./message-item";

import type { Message } from "./types";

export interface MessageListProps {
  messages: Array<Message>;
  isLoading?: boolean;
  className?: string;
}

/**
 * 메시지 목록을 표시하는 컴포넌트
 * 자동 스크롤 및 로딩 상태 처리
 */
export function MessageList({
  messages,
  isLoading = false,
  className = "",
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 추가되면 자동으로 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className={`flex-1 overflow-y-auto px-4 py-6 ${className}`}
    >
      {messages.length === 0 && !isLoading ? (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <p className="text-lg font-medium">대화를 시작하세요</p>
            <p className="text-sm mt-2">
              AI 튜터에게 학습 계획에 대해 질문해보세요
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
            />
          ))}

          {/* 로딩 인디케이터 */}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
