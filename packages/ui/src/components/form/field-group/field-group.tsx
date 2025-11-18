"use client";

import { Group as AriaGroup, composeRenderProps } from "react-aria-components";

import { fieldGroupVariants } from "./field-group.styles";

import type { FieldGroupProps } from "./field-group.types";

/**
 * FieldGroup component
 *
 * @description
 * A container for grouping form field elements together.
 * Built on React Aria Components for accessibility.
 * Useful for creating composite inputs with buttons or icons.
 *
 * @example
 * Basic usage with default variant
 * ```tsx
 * <FieldGroup>
 *   <Input />
 *   <Button>Submit</Button>
 * </FieldGroup>
 * ```
 *
 * @example
 * Ghost variant (no visible container)
 * ```tsx
 * <FieldGroup variant="ghost">
 *   <Input />
 * </FieldGroup>
 * ```
 */
export function FieldGroup({ className, variant, ...props }: FieldGroupProps) {
  return (
    <AriaGroup
      className={composeRenderProps(className, (className, renderProps) =>
        fieldGroupVariants({ ...renderProps, variant, className }),
      )}
      {...props}
    />
  );
}

FieldGroup.displayName = "FieldGroup";
