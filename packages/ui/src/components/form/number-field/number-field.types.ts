import type * as React from "react";
import type {
  ButtonProps as AriaButtonProps,
  InputProps as AriaInputProps,
  NumberFieldProps as AriaNumberFieldProps,
  ValidationResult as AriaValidationResult,
} from "react-aria-components";

export type NumberFieldProps = AriaNumberFieldProps;

export type NumberFieldInputProps = AriaInputProps;

export type NumberFieldStepperProps = AriaButtonProps;

export type NumberFieldSteppersProps = React.ComponentProps<"div">;

export interface FormNumberFieldProps extends AriaNumberFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
}
