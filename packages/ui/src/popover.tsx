"use client";

import {
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
  composeRenderProps,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";

import type {
  DialogProps as AriaDialogProps,
  PopoverProps as AriaPopoverProps,
} from "react-aria-components";

const PopoverTrigger = AriaDialogTrigger;

const Popover = ({ className, offset = 4, ...props }: AriaPopoverProps) => (
  <AriaPopover
    offset={offset}
    className={composeRenderProps(className, (className) =>
      twMerge(
        "z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
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

function PopoverDialog({ className, ...props }: AriaDialogProps) {
  return (
    <AriaDialog
      className={twMerge("p-4 outline-0", className)}
      {...props}
    />
  );
}

export { Popover, PopoverDialog, PopoverTrigger };
