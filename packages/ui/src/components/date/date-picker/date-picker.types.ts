import type {
  DatePickerProps as AriaDatePickerProps,
  DateRangePickerProps as AriaDateRangePickerProps,
  DateValue as AriaDateValue,
  DialogProps as AriaDialogProps,
  PopoverProps as AriaPopoverProps,
  ValidationResult as AriaValidationResult,
} from "react-aria-components";

export type DatePickerProps<T extends AriaDateValue> = AriaDatePickerProps<T>;

export type DateRangePickerProps<T extends AriaDateValue> =
  AriaDateRangePickerProps<T>;

export interface DatePickerContentProps extends AriaDialogProps {
  popoverClassName?: AriaPopoverProps["className"];
}

export interface JollyDatePickerProps<T extends AriaDateValue>
  extends AriaDatePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
}

export interface JollyDateRangePickerProps<T extends AriaDateValue>
  extends AriaDateRangePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
}
