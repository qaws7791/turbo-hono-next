import type {
  DateFieldProps as AriaDateFieldProps,
  DateInputProps as AriaDateInputProps,
  DateSegmentProps as AriaDateSegmentProps,
  DateValue as AriaDateValue,
  TimeFieldProps as AriaTimeFieldProps,
  TimeValue as AriaTimeValue,
  ValidationResult as AriaValidationResult,
} from "react-aria-components";
import type { VariantProps } from "tailwind-variants";
import type { fieldGroupVariants } from "../../form/field-group";

export type DateFieldProps<T extends AriaDateValue> = AriaDateFieldProps<T>;

export type TimeFieldProps<T extends AriaTimeValue> = AriaTimeFieldProps<T>;

export type DateSegmentProps = AriaDateSegmentProps;

export interface DateInputProps
  extends AriaDateInputProps,
    VariantProps<typeof fieldGroupVariants> {}

export interface FormDateFieldProps<T extends AriaDateValue>
  extends AriaDateFieldProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
}

export interface FormTimeFieldProps<T extends AriaTimeValue>
  extends AriaTimeFieldProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
}
