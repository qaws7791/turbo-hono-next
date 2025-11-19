import type { ComponentProps } from "react";
import type { StickToBottom } from "use-stick-to-bottom";
import type { Button } from "../../button";

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export type ConversationContentProps = ComponentProps<
  typeof StickToBottom.Content
>;

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
};

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;
