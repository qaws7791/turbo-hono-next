"use client";

import {
  Button as AriaButton,
  composeRenderProps,
} from "react-aria-components";

import { LoadingSpinner } from "../../feedback/loading-spinner";

import { buttonStyles } from "./button.styles";

import type { ButtonProps } from "./button.types";

/**
 * Button component
 *
 * @description
 * A clickable button component for user actions. Built on React Aria Components for accessibility.
 * Supports multiple visual variants and sizes.
 *
 * @example
 * Basic usage
 * ```tsx
 * <Button onPress={() => console.log('clicked')}>
 *   Click me
 * </Button>
 * ```
 *
 * @example
 * With variants and sizes
 * ```tsx
 * <Button variant="destructive" size="lg" onPress={handleDelete}>
 *   Delete
 * </Button>
 * ```
 *
 * @example
 * Disabled state
 * ```tsx
 * <Button isDisabled>
 *   Disabled
 * </Button>
 * ```
 *
 * @example
 * Loading state
 * ```tsx
 * <Button isLoading>
 *   Submit
 * </Button>
 * ```
 *
 * @example
 * Full width button
 * ```tsx
 * <Button fullWidth>
 *   Full Width
 * </Button>
 * ```
 *
 * @example
 * Icon only button
 * ```tsx
 * <Button isIconOnly>
 *   <Icon />
 * </Button>
 * ```
 */
export function Button({
  className,
  variant,
  size,
  fullWidth,
  isIconOnly,
  isLoading,
  loadingFallback,
  isDisabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      className={composeRenderProps(className, (className, renderProps) =>
        buttonStyles({
          ...renderProps,
          variant,
          size,
          fullWidth,
          isIconOnly,
          className,
        }),
      )}
      isDisabled={isDisabled || isLoading}
      {...props}
    >
      {isLoading
        ? (loadingFallback ?? <LoadingSpinner className="size-4" />)
        : children}
    </AriaButton>
  );
}

Button.displayName = "Button";
