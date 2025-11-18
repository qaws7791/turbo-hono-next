"use client";

import { useSeparator } from "react-aria";

import { cn } from "../../../utils";

import { separatorVariants } from "./separator.styles";

import type { SeparatorProps } from "./separator.types";

/**
 * Separator component
 *
 * @description
 * A visual divider to separate content. Built on React Aria for accessibility.
 * Supports both horizontal and vertical orientations.
 *
 * @example
 * Horizontal separator (default)
 * ```tsx
 * <Separator />
 * ```
 *
 * @example
 * Vertical separator
 * ```tsx
 * <div className="flex h-10">
 *   <span>Left</span>
 *   <Separator orientation="vertical" />
 *   <span>Right</span>
 * </div>
 * ```
 *
 * @example
 * With custom styling
 * ```tsx
 * <Separator className="my-4" />
 * ```
 */
export function Separator({ className, ...props }: SeparatorProps) {
  const { separatorProps } = useSeparator(props);

  return (
    <div
      {...separatorProps}
      className={cn(separatorVariants(), className)}
    />
  );
}

Separator.displayName = "Separator";
