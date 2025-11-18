"use client";

import { Label as AriaLabel } from "react-aria-components";

import { labelVariants } from "./label.styles";

import type { LabelProps } from "./label.types";

/**
 * Label component
 *
 * @description
 * A label for form fields. Built on React Aria Components for accessibility.
 * Automatically handles disabled and invalid states.
 *
 * @example
 * Basic usage
 * ```tsx
 * <Label>Username</Label>
 * ```
 *
 * @example
 * With custom styling
 * ```tsx
 * <Label className="text-lg">Email</Label>
 * ```
 */
export function Label({ className, ...props }: LabelProps) {
  return (
    <AriaLabel
      className={labelVariants({ className })}
      {...props}
    />
  );
}

Label.displayName = "Label";
