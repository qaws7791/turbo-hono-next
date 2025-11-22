"use client";

import { ArrowLeftIcon } from "lucide-react";
import { memo } from "react";

import { cn } from "../../../utils";
import { Button } from "../../button";

import type {
  ChatbotContentProps,
  ChatbotHeaderActionsProps,
  ChatbotHeaderBackButtonProps,
  ChatbotHeaderProps,
  ChatbotHeaderTitleProps,
  ChatbotProps,
} from "./chatbot.types";

/**
 * Chatbot 루트 컴포넌트
 * 채팅 UI 전체 컨테이너
 *
 * @example
 * ```tsx
 * <Chatbot>
 *   <ChatbotHeader>
 *     <ChatbotHeaderTitle>Chat Title</ChatbotHeaderTitle>
 *     <ChatbotHeaderActions>
 *       <Button isIconOnly variant="ghost">...</Button>
 *     </ChatbotHeaderActions>
 *   </ChatbotHeader>
 *   <ChatbotContent>
 *     <Conversation>...</Conversation>
 *     <PromptInput>...</PromptInput>
 *   </ChatbotContent>
 * </Chatbot>
 * ```
 */
export const Chatbot = memo(
  ({ className, children, ...props }: ChatbotProps) => (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden bg-background",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

Chatbot.displayName = "Chatbot";

/**
 * ChatbotHeader 컴포넌트
 * 상단 헤더 영역 (제목 + 액션 버튼)
 */
export const ChatbotHeader = memo(
  ({ className, children, ...props }: ChatbotHeaderProps) => (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-4",
        className,
      )}
      {...props}
    >
      {children}
    </header>
  ),
);

ChatbotHeader.displayName = "ChatbotHeader";

/**
 * ChatbotHeaderBackButton 컴포넌트
 * 뒤로가기 버튼 (히스토리 뷰에서 사용)
 */
export const ChatbotHeaderBackButton = memo(
  ({
    className,
    label = "뒤로 가기",
    ...props
  }: ChatbotHeaderBackButtonProps) => (
    <Button
      type="button"
      variant="ghost"
      isIconOnly
      size="sm"
      className={cn("-ml-2", className)}
      aria-label={label}
      {...props}
    >
      <ArrowLeftIcon className="size-5" />
    </Button>
  ),
);

ChatbotHeaderBackButton.displayName = "ChatbotHeaderBackButton";

/**
 * ChatbotHeaderTitle 컴포넌트
 * 헤더 제목 영역
 */
export const ChatbotHeaderTitle = memo(
  ({ className, children, ...props }: ChatbotHeaderTitleProps) => (
    <h1
      className={cn(
        "min-w-0 flex-1 truncate font-medium text-base text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  ),
);

ChatbotHeaderTitle.displayName = "ChatbotHeaderTitle";

/**
 * ChatbotHeaderActions 컴포넌트
 * 헤더 오른쪽 액션 버튼 영역
 */
export const ChatbotHeaderActions = memo(
  ({ className, children, ...props }: ChatbotHeaderActionsProps) => (
    <div
      className={cn("flex shrink-0 items-center gap-1", className)}
      {...props}
    >
      {children}
    </div>
  ),
);

ChatbotHeaderActions.displayName = "ChatbotHeaderActions";

/**
 * ChatbotContent 컴포넌트
 * 메인 콘텐츠 영역 (Conversation + PromptInput)
 */
export const ChatbotContent = memo(
  ({ className, children, ...props }: ChatbotContentProps) => (
    <main
      className={cn("flex min-h-0 flex-1 flex-col", className)}
      {...props}
    >
      {children}
    </main>
  ),
);

ChatbotContent.displayName = "ChatbotContent";
