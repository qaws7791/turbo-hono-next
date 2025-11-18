"use client";

import {
  FieldError as AriaFieldError,
  composeRenderProps,
} from "react-aria-components";

import { cn } from "../../../utils";

import type { FieldErrorProps } from "./field-error.types";

/**
 * FieldError component
 *
 * @description
 * Displays validation error messages for form fields.
 * Built on React Aria Components for accessibility.
 *
 * @example
 * Basic usage
 * ```tsx
 * <FieldError>This field is required</FieldError>
 * ```
 *
 * @example
 * With custom styling
 * ```tsx
 * <FieldError className="font-bold">
 *   Password must be at least 8 characters
 * </FieldError>
 * ```
 */
export function FieldError({ className, ...props }: FieldErrorProps) {
  return (
    <AriaFieldError
      className={composeRenderProps(className, (className) =>
        cn("text-sm font-medium text-destructive", className),
      )}
      {...props}
    />
  );
}

FieldError.displayName = "FieldError";
