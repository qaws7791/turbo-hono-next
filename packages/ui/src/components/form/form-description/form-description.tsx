"use client";

import { Text as AriaText } from "react-aria-components";

import { formDescriptionVariants } from "./form-description.styles";

import type { FormDescriptionProps } from "./form-description.types";

/**
 * FormDescription component
 *
 * @description
 * Displays helpful description text for form fields.
 * Built on React Aria Components for accessibility.
 *
 * @example
 * Basic usage
 * ```tsx
 * <FormDescription>
 *   Enter your email address for notifications
 * </FormDescription>
 * ```
 *
 * @example
 * With custom styling
 * ```tsx
 * <FormDescription className="text-xs">
 *   This will be visible to other users
 * </FormDescription>
 * ```
 */
export function FormDescription({ className, ...props }: FormDescriptionProps) {
  return (
    <AriaText
      className={formDescriptionVariants({ className })}
      slot="description"
      {...props}
    />
  );
}

FormDescription.displayName = "FormDescription";
