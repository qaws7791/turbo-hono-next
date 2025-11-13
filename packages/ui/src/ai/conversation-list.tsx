/**
 * 대화 세션 목록 컴포넌트
 */

import { Button } from "../button";

import { ConversationItem } from "./conversation-item";

import type { Conversation } from "./types";

export interface ConversationListProps {
  conversations: Array<Conversation>;
  selectedId: string | null;
  onSelect: (conversationId: string) => void;
  onCreateNew?: () => void;
  onDelete?: (conversationId: string) => void;
  className?: string;
}

/**
 * 대화 세션 목록 컴포넌트
 */
export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onCreateNew,
  onDelete,
  className = "",
}: ConversationListProps) {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          대화 목록
        </h3>

        {/* 새 대화 버튼 */}
        {onCreateNew && (
          <Button
            onPress={onCreateNew}
            className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600
                     text-white rounded-md transition-colors"
          >
            + 새 대화
          </Button>
        )}
      </div>

      {/* 대화 세션 목록 */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center px-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                대화 내역이 없습니다
              </p>
              {onCreateNew && (
                <Button
                  onPress={onCreateNew}
                  className="mt-4 text-xs px-3 py-2 bg-blue-500 hover:bg-blue-600
                           text-white rounded-md transition-colors"
                >
                  첫 대화 시작하기
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedId}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
