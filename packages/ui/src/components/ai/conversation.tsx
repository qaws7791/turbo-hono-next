"use client";

import { ArrowDownIcon } from "lucide-react";
import { useCallback } from "react";
import { composeRenderProps } from "react-aria-components";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

import { Button } from "../button";
import { twMerge } from "../../utils";

import type { ComponentProps } from "react";

export type ConversationProps = ComponentProps<typeof StickToBottom>;

/**
 * Conversation component
 *
 * @description
 * Container for displaying a conversation or chat messages. Built on use-stick-to-bottom for automatic
 * scrolling to the latest message. Use with ConversationContent to hold messages and ConversationEmptyState
 * for empty state display.
 *
 * @example
 * Basic usage
 * ```tsx
 * <Conversation>
 *   <ConversationContent>
 *     {messages.map((msg) => (
 *       <Message key={msg.id} message={msg} />
 *     ))}
 *   </ConversationContent>
 * </Conversation>
 * ```
 */
export const Conversation = ({ className, ...props }: ConversationProps) => (
  <StickToBottom
    className={twMerge("relative flex-1 overflow-y-hidden", className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
);

export type ConversationContentProps = ComponentProps<
  typeof StickToBottom.Content
>;

/**
 * ConversationContent component
 *
 * @description
 * Container for message content within a Conversation. Provides flex layout with spacing
 * for displaying individual messages.
 *
 * @example
 * ```tsx
 * <ConversationContent>
 *   {messages.map((msg) => <Message key={msg.id} {...msg} />)}
 * </ConversationContent>
 * ```
 */
export const ConversationContent = ({
  className,
  ...props
}: ConversationContentProps) => (
  <StickToBottom.Content
    className={twMerge("flex flex-col gap-8 p-4", className)}
    {...props}
  />
);

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
};

export const ConversationEmptyState = ({
  className,
  title = "No messages yet",
  description = "Start a conversation to see messages here",
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <div
    className={twMerge(
      "flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
      className,
    )}
    {...props}
  >
    {children ?? (
      <>
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div className="space-y-1">
          <h3 className="font-medium text-sm">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </>
    )}
  </div>
);

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    !isAtBottom && (
      <Button
        className={composeRenderProps(className, (className) =>
          twMerge(
            "absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full",
            className,
          ),
        )}
        onClick={handleScrollToBottom}
        size="icon"
        type="button"
        variant="outline"
        {...props}
      >
        <ArrowDownIcon className="size-4" />
      </Button>
    )
  );
};
