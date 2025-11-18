import type * as React from "react";
import type {
  ButtonProps as AriaButtonProps,
  ListBoxProps as AriaListBoxProps,
  PopoverProps as AriaPopoverProps,
  SelectProps as AriaSelectProps,
  SelectValueProps as AriaSelectValueProps,
  ValidationResult as AriaValidationResult,
} from "react-aria-components";

export type SelectProps<T extends object> = AriaSelectProps<T>;

export type SelectValueProps<T extends object> = AriaSelectValueProps<T>;

export type SelectTriggerProps = AriaButtonProps;

export type SelectPopoverProps = AriaPopoverProps;

export type SelectListBoxProps<T extends object> = AriaListBoxProps<T>;

export interface FormSelectProps<T extends object>
  extends Omit<AriaSelectProps<T>, "children"> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}
