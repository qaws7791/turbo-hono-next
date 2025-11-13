/**
 * 대화 세션 아이템 컴포넌트
 */

import React from "react";
import { Button } from "react-aria-components";

import type { Conversation } from "./types";

export interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversationId: string) => void;
  onDelete?: (conversationId: string) => void;
  className?: string;
}

/**
 * 대화 세션 목록의 개별 아이템
 */
export function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  onDelete,
  className = "",
}: ConversationItemProps) {
  const displayTitle = conversation.title || "새 대화";

  const formattedDate = new Date(conversation.updatedAt).toLocaleDateString(
    "ko-KR",
    {
      month: "short",
      day: "numeric",
    },
  );

  return (
    <div
      className={`group relative rounded-lg px-3 py-2 cursor-pointer transition-colors ${
        isSelected
          ? "bg-blue-100 dark:bg-blue-900"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      } ${className}`}
      onClick={() => onSelect(conversation.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* 제목 */}
          <div
            className={`text-sm font-medium truncate ${
              isSelected
                ? "text-blue-900 dark:text-blue-100"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {displayTitle}
          </div>

          {/* 날짜 */}
          <div
            className={`text-xs mt-1 ${
              isSelected
                ? "text-blue-700 dark:text-blue-300"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {formattedDate}
          </div>
        </div>

        {/* 삭제 버튼 (호버 시 표시) */}
        {onDelete && (
          <Button
            onPress={() => {
              onDelete(conversation.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity
                     text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          >
            <span className="text-sm">🗑️</span>
          </Button>
        )}
      </div>
    </div>
  );
}
