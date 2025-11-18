"use client";

import {
  DateField as AriaDateField,
  DateInput as AriaDateInput,
  DateSegment as AriaDateSegment,
  TimeField as AriaTimeField,
  Text,
  composeRenderProps,
} from "react-aria-components";

import { cn } from "../../../utils";
import { FieldError, Label, fieldGroupVariants } from "../../form";

import type {
  DateInputProps,
  DateSegmentProps,
  FormDateFieldProps,
  FormTimeFieldProps,
} from "./date-field.types";
import type {
  DateValue as AriaDateValue,
  TimeValue as AriaTimeValue,
} from "react-aria-components";

/**
 * DateField component - Base date input field
 *
 * @example
 * ```tsx
 * <DateField value={date} onChange={setDate}>
 *   <Label>Birth Date</Label>
 *   <DateInput />
 * </DateField>
 * ```
 */
const DateField = AriaDateField;

/**
 * TimeField component - Base time input field
 *
 * @example
 * ```tsx
 * <TimeField value={time} onChange={setTime}>
 *   <Label>Meeting Time</Label>
 *   <DateInput />
 * </TimeField>
 * ```
 */
const TimeField = AriaTimeField;

/**
 * DateSegment component - Individual segment of a date (day, month, year, etc.)
 *
 * @example
 * ```tsx
 * <DateSegment segment={segment} />
 * ```
 */
function DateSegment({ className, ...props }: DateSegmentProps) {
  return (
    <AriaDateSegment
      className={composeRenderProps(className, (className) =>
        cn(
          "type-literal:px-0 inline rounded p-0.5 caret-transparent outline outline-0",
          /* Placeholder */
          "data-[placeholder]:text-muted-foreground",
          /* Disabled */
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          /* Focused */
          "data-[focused]:bg-accent data-[focused]:text-accent-foreground",
          /* Invalid */
          "data-[invalid]:data-[focused]:bg-destructive data-[invalid]:data-[focused]:data-[placeholder]:text-destructive-foreground data-[invalid]:data-[focused]:text-destructive-foreground data-[invalid]:data-[placeholder]:text-destructive data-[invalid]:text-destructive",
          className,
        ),
      )}
      {...props}
    />
  );
}

/**
 * DateInput component - Container for date segments
 *
 * @example
 * ```tsx
 * <DateInput />
 * ```
 *
 * @example
 * ```tsx
 * <DateInput variant="ghost" />
 * ```
 */
function DateInput({
  className,
  variant,
  ...props
}: Omit<DateInputProps, "children">) {
  return (
    <AriaDateInput
      className={composeRenderProps(className, (className) =>
        cn(fieldGroupVariants({ variant }), "text-sm", className),
      )}
      {...props}
    >
      {(segment) => <DateSegment segment={segment} />}
    </AriaDateInput>
  );
}

/**
 * FormDateField component - Date field with label, description and error message
 *
 * @example
 * ```tsx
 * <FormDateField
 *   label="Date of Birth"
 *   description="Enter your date of birth"
 *   errorMessage="Date is required"
 * />
 * ```
 */
function FormDateField<T extends AriaDateValue>({
  label,
  description,
  className,
  errorMessage,
  ...props
}: FormDateFieldProps<T>) {
  return (
    <DateField
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className),
      )}
      {...props}
    >
      <Label>{label}</Label>
      <DateInput />
      {description && (
        <Text
          className="text-sm text-muted-foreground"
          slot="description"
        >
          {description}
        </Text>
      )}
      <FieldError>{errorMessage}</FieldError>
    </DateField>
  );
}

/**
 * FormTimeField component - Time field with label, description and error message
 *
 * @example
 * ```tsx
 * <FormTimeField
 *   label="Meeting Time"
 *   description="Select a time"
 *   errorMessage="Time is required"
 * />
 * ```
 */
function FormTimeField<T extends AriaTimeValue>({
  label,
  description,
  errorMessage,
  className,
  ...props
}: FormTimeFieldProps<T>) {
  return (
    <TimeField
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className),
      )}
      {...props}
    >
      <Label>{label}</Label>
      <DateInput />
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
    </TimeField>
  );
}

export {
  DateField,
  DateInput,
  DateSegment,
  FormDateField,
  FormTimeField,
  TimeField,
};
