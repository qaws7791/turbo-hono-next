"use client";

import { Link as AriaLink, composeRenderProps } from "react-aria-components";

import { cn } from "../../../utils";
import { buttonStyles } from "../../button/button/button.styles";

import type { LinkProps } from "./link.types";

/**
 * Link - Accessible link component with optional button styling.
 * Built on React Aria for full keyboard and screen reader support.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <Link href="/about">
 *   About Us
 * </Link>
 * ```
 *
 * @example
 * Button-styled link:
 * ```tsx
 * <Link
 *   href="/signup"
 *   variant="default"
 *   size="lg"
 * >
 *   Get Started
 * </Link>
 * ```
 *
 * @example
 * External link:
 * ```tsx
 * <Link
 *   href="https://example.com"
 *   target="_blank"
 *   rel="noopener noreferrer"
 * >
 *   Visit External Site
 * </Link>
 * ```
 *
 * @example
 * As a button variant:
 * ```tsx
 * <Link
 *   href="/dashboard"
 *   variant="outline"
 *   size="sm"
 * >
 *   <DashboardIcon />
 *   Dashboard
 * </Link>
 * ```
 */
const Link = ({ className, variant, size, ...props }: LinkProps) => {
  return (
    <AriaLink
      className={composeRenderProps(className, (className) =>
        cn(
          variant &&
            buttonStyles({
              variant,
              size,
              className,
            }),
        ),
      )}
      {...props}
    />
  );
};

Link.displayName = "Link";

export { Link };
