"use client";

import { PaperclipIcon, XIcon } from "lucide-react";
import { memo } from "react";
import { Streamdown } from "streamdown";

import { cn } from "../../../utils";
import { Button } from "../../button";
import { Tooltip, TooltipTrigger } from "../../overlay/tooltip";

import type {
  MessageActionProps,
  MessageActionsProps,
  MessageAttachmentProps,
  MessageAttachmentsProps,
  MessageContentProps,
  MessageProps,
  MessageResponseProps,
  MessageToolbarProps,
} from "./message.types";

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      "group flex w-full max-w-[80%] flex-col gap-2",
      from === "user" ? "is-user ml-auto justify-end" : "is-assistant",
      className,
    )}
    {...props}
  />
);

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      "is-user:dark flex w-fit flex-col gap-2 overflow-hidden text-sm",
      "group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground",
      "group-[.is-assistant]:text-foreground",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const MessageActions = ({
  className,
  children,
  ...props
}: MessageActionsProps) => (
  <div
    className={cn("flex items-center gap-1", className)}
    {...props}
  >
    {children}
  </div>
);

export const MessageAction = ({
  tooltip,
  label,
  size = "sm",
  variant = "ghost",
  "aria-label": ariaLabel,
  ...props
}: MessageActionProps) => {
  const button = (
    <Button
      size={size}
      type="button"
      variant={variant}
      aria-label={ariaLabel || label || tooltip}
      {...props}
    />
  );

  if (tooltip) {
    return (
      <TooltipTrigger>
        {button}
        <Tooltip>
          <p>{tooltip}</p>
        </Tooltip>
      </TooltipTrigger>
    );
  }

  return button;
};

export const MessageResponse = memo(
  ({ className, ...props }: MessageResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

MessageResponse.displayName = "MessageResponse";

export function MessageAttachment({
  data,
  className,
  onRemove,
  ...props
}: MessageAttachmentProps) {
  const filename = data.filename || "";
  const mediaType =
    data.mediaType?.startsWith("image/") && data.url ? "image" : "file";
  const isImage = mediaType === "image";
  const attachmentLabel = filename || (isImage ? "Image" : "Attachment");

  return (
    <div
      className={cn(
        "group relative size-24 overflow-hidden rounded-lg",
        className,
      )}
      {...props}
    >
      {isImage ? (
        <>
          <img
            alt={filename || "attachment"}
            className="size-full object-cover"
            height={100}
            src={data.url}
            width={100}
          />
          {onRemove && (
            <Button
              aria-label="Remove attachment"
              className="absolute top-2 right-2 size-6 rounded-full bg-background/80 p-0 opacity-0 backdrop-blur-sm transition-opacity hover:bg-background group-hover:opacity-100 [&>svg]:size-3"
              onPress={onRemove}
              type="button"
              variant="ghost"
            >
              <XIcon />
              <span className="sr-only">Remove</span>
            </Button>
          )}
        </>
      ) : (
        <>
          <TooltipTrigger>
            <div className="flex size-full shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <PaperclipIcon className="size-4" />
            </div>
            <Tooltip>
              <p>{attachmentLabel}</p>
            </Tooltip>
          </TooltipTrigger>
          {onRemove && (
            <Button
              aria-label="Remove attachment"
              className="size-6 shrink-0 rounded-full p-0 opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100 [&>svg]:size-3"
              onPress={onRemove}
              type="button"
              variant="ghost"
            >
              <XIcon />
              <span className="sr-only">Remove</span>
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export function MessageAttachments({
  children,
  className,
  ...props
}: MessageAttachmentsProps) {
  if (!children) {
    return null;
  }

  return (
    <div
      className={cn(
        "ml-auto flex w-fit flex-wrap items-start gap-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export const MessageToolbar = ({
  className,
  children,
  ...props
}: MessageToolbarProps) => (
  <div
    className={cn(
      "mt-4 flex w-full items-center justify-between gap-4",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);
