"use client";

import { Check, Minus } from "lucide-react";
import {
  Checkbox as AriaCheckbox,
  CheckboxGroup as AriaCheckboxGroup,
  Text,
  composeRenderProps,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";

import { FieldError, Label } from "..";

import { checkboxInnerStyles, checkboxStyles } from "./checkbox.styles";

import type { CheckboxProps, FormCheckboxGroupProps } from "./checkbox.types";

/**
 * CheckboxGroup component
 *
 * @description
 * A container for multiple checkbox components. Built on React Aria Components for accessibility.
 * Manages selection state and provides grouped checkbox functionality.
 *
 * @example
 * ```tsx
 * <CheckboxGroup>
 *   <Checkbox value="option1">Option 1</Checkbox>
 *   <Checkbox value="option2">Option 2</Checkbox>
 * </CheckboxGroup>
 * ```
 */
const CheckboxGroup = AriaCheckboxGroup;

/**
 * Checkbox component
 *
 * @description
 * A checkbox input control for selecting one or more options. Built on React Aria Components for accessibility.
 * Supports checked, unchecked, and indeterminate states.
 *
 * @example
 * Basic usage
 * ```tsx
 * <Checkbox value="subscribe">
 *   Subscribe to newsletter
 * </Checkbox>
 * ```
 *
 * @example
 * Indeterminate state
 * ```tsx
 * <Checkbox isIndeterminate>
 *   Partial selection
 * </Checkbox>
 * ```
 */
const Checkbox = ({ className, children, ...props }: CheckboxProps) => (
  <AriaCheckbox
    className={composeRenderProps(className, (className) =>
      checkboxStyles({ className }),
    )}
    {...props}
  >
    {composeRenderProps(children, (children, renderProps) => (
      <>
        <div className={checkboxInnerStyles()}>
          {renderProps.isIndeterminate ? (
            <Minus className="size-4" />
          ) : renderProps.isSelected ? (
            <Check className="size-4" />
          ) : null}
        </div>
        {children}
      </>
    ))}
  </AriaCheckbox>
);

/**
 * FormCheckboxGroup component - Checkbox group with label, description and error message
 *
 * @example
 * ```tsx
 * <FormCheckboxGroup
 *   label="Select options"
 *   description="Choose one or more"
 *   errorMessage="At least one option is required"
 * >
 *   <Checkbox value="option1">Option 1</Checkbox>
 *   <Checkbox value="option2">Option 2</Checkbox>
 * </FormCheckboxGroup>
 * ```
 */
function FormCheckboxGroup({
  label,
  description,
  errorMessage,
  className,
  children,
  ...props
}: FormCheckboxGroupProps) {
  return (
    <CheckboxGroup
      className={composeRenderProps(className, (className) =>
        twMerge("group flex flex-col gap-2", className),
      )}
      {...props}
    >
      {composeRenderProps(children, (children) => (
        <>
          <Label>{label}</Label>
          {children}
          {description && (
            <Text
              className="text-sm text-muted-foreground"
              slot="description"
            >
              {description}
            </Text>
          )}
          <FieldError>{errorMessage}</FieldError>
        </>
      ))}
    </CheckboxGroup>
  );
}

export { Checkbox, CheckboxGroup, FormCheckboxGroup };
