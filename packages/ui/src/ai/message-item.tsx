/**
 * 개별 메시지 컴포넌트
 */

import React from "react";

import { ToolInvocation } from "./tool-invocation";

import type { Message } from "./types";

export interface MessageItemProps {
  message: Message;
  className?: string;
}

/**
 * 메시지 아이템 컴포넌트
 */
export function MessageItem({ message, className = "" }: MessageItemProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 ${className}`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-blue-500 text-white"
            : isAssistant
              ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
              : "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
        }`}
      >
        {/* 메시지 내용 */}
        <div className="whitespace-pre-wrap break-words">{message.content}</div>

        {/* Tool 호출 정보 */}
        {message.toolInvocations && message.toolInvocations.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.toolInvocations.map((invocation) => (
              <ToolInvocation
                key={invocation.toolCallId}
                invocation={invocation}
              />
            ))}
          </div>
        )}

        {/* 시간 정보 */}
        <div
          className={`mt-2 text-xs ${isUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}
        >
          {new Date(message.createdAt).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
