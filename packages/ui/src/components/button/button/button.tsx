"use client";

import {
  Button as AriaButton,
  composeRenderProps,
} from "react-aria-components";

import { buttonVariants } from "../../../styles/variants/button-variants";

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
 */
export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <AriaButton
      className={composeRenderProps(className, (className, renderProps) =>
        buttonVariants({
          ...renderProps,
          variant,
          size,
          className,
        }),
      )}
      {...props}
    />
  );
}

Button.displayName = "Button";
