"use client";

import { badgeStyles } from "./badge.styles";

import type { BadgeProps } from "./badge.types";

/**
 * Badge component - Small status indicator or label
 *
 * @example
 * ```tsx
 * <Badge variant="primary">New</Badge>
 * ```
 *
 * @example
 * ```tsx
 * <Badge variant="destructive">Error</Badge>
 * ```
 *
 * @example
 * ```tsx
 * <Badge variant="outline">Status</Badge>
 * ```
 */
const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return (
    <div
      className={badgeStyles({
        variant,
        className,
      })}
      {...props}
    />
  );
};

export { Badge, badgeStyles };
