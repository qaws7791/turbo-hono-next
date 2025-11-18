import type {
  CheckboxGroupProps as AriaCheckboxGroupProps,
  CheckboxProps as AriaCheckboxProps,
  ValidationResult as AriaValidationResult,
} from "react-aria-components";

export type CheckboxProps = AriaCheckboxProps;

export type CheckboxGroupProps = AriaCheckboxGroupProps;

export interface FormCheckboxGroupProps extends AriaCheckboxGroupProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
}
