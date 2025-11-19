import type { FileUIPart, UIMessage } from "ai";
import type { ComponentProps } from "react";
import type { Streamdown } from "streamdown";
import type { ButtonProps } from "../../button";

export type MessageProps = ComponentProps<"div"> & {
  from: UIMessage["role"];
};

export type MessageContentProps = ComponentProps<"div">;

export type MessageActionsProps = ComponentProps<"div">;

export type MessageActionProps = ButtonProps & {
  tooltip?: string;
  label?: string;
};

export type MessageResponseProps = ComponentProps<typeof Streamdown>;

export type MessageAttachmentProps = ComponentProps<"div"> & {
  data: FileUIPart;
  className?: string;
  onRemove?: () => void;
};

export type MessageAttachmentsProps = ComponentProps<"div">;

export type MessageToolbarProps = ComponentProps<"div">;
