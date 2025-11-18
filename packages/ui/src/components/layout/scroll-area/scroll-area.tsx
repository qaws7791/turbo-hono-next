"use client";

import * as React from "react";

import { twMerge } from "../../../utils";

import type { ScrollAreaProps } from "./scroll-area.types";

/**
 * ScrollArea - Styled scrollable container with custom scrollbar.
 * Provides consistent scrollbar styling across browsers.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <ScrollArea className="h-96">
 *   <div>
 *     Long content that requires scrolling...
 *   </div>
 * </ScrollArea>
 * ```
 *
 * @example
 * Horizontal scrolling:
 * ```tsx
 * <ScrollArea orientation="horizontal" className="w-96">
 *   <div className="flex gap-4">
 *     {items.map(item => <Card key={item.id}>{item.name}</Card>)}
 *   </div>
 * </ScrollArea>
 * ```
 *
 * @example
 * Both directions:
 * ```tsx
 * <ScrollArea orientation="both" className="h-96 w-96">
 *   <div className="h-[1000px] w-[1000px]">
 *     Large content...
 *   </div>
 * </ScrollArea>
 * ```
 */
const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, orientation = "vertical", children, ...props }, ref) => {
    const orientationClasses = {
      vertical: "overflow-y-auto overflow-x-hidden",
      horizontal: "overflow-x-auto overflow-y-hidden",
      both: "overflow-auto",
    };

    return (
      <div
        ref={ref}
        className={twMerge(
          "relative",
          orientationClasses[orientation],
          /* Custom scrollbar styles */
          "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border",
          "hover:scrollbar-thumb-muted-foreground/50",
          "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border",
          "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
