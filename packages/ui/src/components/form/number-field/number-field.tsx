"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Input as AriaInput,
  NumberField as AriaNumberField,
  Text,
  composeRenderProps,
} from "react-aria-components";

// TODO: Import from new location once button is migrated
import { FieldError, FieldGroup, Label } from "..";
import { Button } from "../../button";

import type {
  FormNumberFieldProps,
  NumberFieldInputProps,
  NumberFieldStepperProps,
  NumberFieldSteppersProps,
} from "./number-field.types";

/**
 * NumberField component - Base number input with increment/decrement controls
 *
 * @example
 * ```tsx
 * <NumberField value={5} onChange={setValue}>
 *   <Label>Quantity</Label>
 *   <FieldGroup>
 *     <NumberFieldInput />
 *     <NumberFieldSteppers />
 *   </FieldGroup>
 * </NumberField>
 * ```
 */
const NumberField = AriaNumberField;

/**
 * NumberFieldInput component - Text input for number value
 *
 * @example
 * ```tsx
 * <NumberFieldInput placeholder="0" />
 * ```
 */
function NumberFieldInput({ className, ...props }: NumberFieldInputProps) {
  return (
    <AriaInput
      className={composeRenderProps(className, (className) =>
        cn(
          "w-fit min-w-0 flex-1 border-r border-transparent bg-background pr-2 outline-0 placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden",
          className,
        ),
      )}
      {...props}
    />
  );
}

/**
 * NumberFieldSteppers component - Container for increment/decrement buttons
 *
 * @example
 * ```tsx
 * <NumberFieldSteppers />
 * ```
 */
function NumberFieldSteppers({
  className,
  ...props
}: NumberFieldSteppersProps) {
  return (
    <div
      className={cn(
        "absolute right-0 flex h-full flex-col border-l",
        className,
      )}
      {...props}
    >
      <NumberFieldStepper slot="increment">
        <ChevronUp
          aria-hidden
          className="size-4"
        />
      </NumberFieldStepper>
      <div className="border-b" />
      <NumberFieldStepper slot="decrement">
        <ChevronDown
          aria-hidden
          className="size-4"
        />
      </NumberFieldStepper>
    </div>
  );
}

/**
 * NumberFieldStepper component - Individual increment/decrement button
 *
 * @example
 * ```tsx
 * <NumberFieldStepper slot="increment">
 *   <ChevronUp />
 * </NumberFieldStepper>
 * ```
 */
function NumberFieldStepper({ className, ...props }: NumberFieldStepperProps) {
  return (
    <Button
      className={composeRenderProps(className, (className) =>
        cn("w-auto grow rounded-none px-0.5 text-muted-foreground", className),
      )}
      variant={"ghost"}
      size={"icon"}
      {...props}
    />
  );
}

/**
 * FormNumberField component - Number field with label, description and error message
 *
 * @example
 * ```tsx
 * <FormNumberField
 *   label="Quantity"
 *   description="Enter a number between 1 and 100"
 *   errorMessage="Value must be at least 1"
 *   minValue={1}
 *   maxValue={100}
 * />
 * ```
 */
function FormNumberField({
  label,
  description,
  errorMessage,
  className,
  ...props
}: FormNumberFieldProps) {
  return (
    <NumberField
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className),
      )}
      {...props}
    >
      <Label>{label}</Label>
      <FieldGroup>
        <NumberFieldInput />
        <NumberFieldSteppers />
      </FieldGroup>
      {description && (
        <Text
          className="text-sm text-muted-foreground"
          slot="description"
        >
          {description}
        </Text>
      )}
      <FieldError>{errorMessage}</FieldError>
    </NumberField>
  );
}

export {
  FormNumberField,
  NumberField,
  NumberFieldInput,
  NumberFieldStepper,
  NumberFieldSteppers,
};
