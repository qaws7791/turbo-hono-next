"use client";

import {
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
  composeRenderProps,
} from "react-aria-components";

import { cn } from "../../../utils";

import type { PopoverDialogProps, PopoverProps } from "./popover.types";

/**
 * PopoverTrigger - Triggers the popover display.
 * Re-exported from React Aria.
 */
const PopoverTrigger = AriaDialogTrigger;

/**
 * Popover - Floating overlay container positioned relative to a trigger.
 * Supports animations and multiple placement options.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <PopoverTrigger>
 *   <Button>Open</Button>
 *   <Popover>
 *     <PopoverDialog>
 *       <h3>Popover Title</h3>
 *       <p>Popover content goes here.</p>
 *     </PopoverDialog>
 *   </Popover>
 * </PopoverTrigger>
 * ```
 *
 * @example
 * With custom placement:
 * ```tsx
 * <Popover placement="bottom start" offset={10}>
 *   <PopoverDialog>
 *     Content aligned to bottom-start
 *   </PopoverDialog>
 * </Popover>
 * ```
 *
 * @example
 * Non-modal popover:
 * ```tsx
 * <Popover isNonModal>
 *   <PopoverDialog>
 *     Can interact with page while open
 *   </PopoverDialog>
 * </Popover>
 * ```
 */
const Popover = ({ className, offset = 4, ...props }: PopoverProps) => (
  <AriaPopover
    offset={offset}
    className={composeRenderProps(className, (className) =>
      cn(
        "z-50 rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none",
        /* Entering */
        "data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95",
        /* Exiting */
        "data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
        /* Placement */
        "data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2",
        className,
      ),
    )}
    {...props}
  />
);

Popover.displayName = "Popover";

/**
 * PopoverDialog - Content container for the popover.
 * Provides padding and outline handling.
 *
 * @example
 * ```tsx
 * <Popover>
 *   <PopoverDialog>
 *     <h3>Title</h3>
 *     <p>Content</p>
 *   </PopoverDialog>
 * </Popover>
 * ```
 */
function PopoverDialog({ className, ...props }: PopoverDialogProps) {
  return (
    <AriaDialog
      className={cn("p-4 outline-0", className)}
      {...props}
    />
  );
}

PopoverDialog.displayName = "PopoverDialog";

export { Popover, PopoverDialog, PopoverTrigger };
