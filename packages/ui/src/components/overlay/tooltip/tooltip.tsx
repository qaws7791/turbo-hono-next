"use client";

import {
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger,
  composeRenderProps,
} from "react-aria-components";

import { cn } from "../../../utils";

import type { TooltipProps } from "./tooltip.types";

/**
 * TooltipTrigger - Triggers the tooltip display on hover or focus.
 * Re-exported from React Aria.
 */
const TooltipTrigger = AriaTooltipTrigger;

/**
 * Tooltip - Floating text label that appears on hover or focus.
 * Provides contextual information about an element.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <TooltipTrigger>
 *   <Button>Hover me</Button>
 *   <Tooltip>
 *     This is a helpful tooltip
 *   </Tooltip>
 * </TooltipTrigger>
 * ```
 *
 * @example
 * With custom offset:
 * ```tsx
 * <TooltipTrigger>
 *   <Button>Save</Button>
 *   <Tooltip offset={10}>
 *     Save your changes
 *   </Tooltip>
 * </TooltipTrigger>
 * ```
 *
 * @example
 * With delay:
 * ```tsx
 * <TooltipTrigger delay={500}>
 *   <Button>Delete</Button>
 *   <Tooltip>
 *     Permanently delete this item
 *   </Tooltip>
 * </TooltipTrigger>
 * ```
 *
 * @example
 * Disabled tooltip:
 * ```tsx
 * <TooltipTrigger isDisabled>
 *   <Button>No tooltip</Button>
 *   <Tooltip>
 *     This won't show
 *   </Tooltip>
 * </TooltipTrigger>
 * ```
 */
const Tooltip = ({ className, offset = 4, ...props }: TooltipProps) => (
  <AriaTooltip
    offset={offset}
    className={composeRenderProps(className, (className) =>
      cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0",
        /* Entering */
        "data-[entering]:zoom-in-95",
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

Tooltip.displayName = "Tooltip";

export { Tooltip, TooltipTrigger };
