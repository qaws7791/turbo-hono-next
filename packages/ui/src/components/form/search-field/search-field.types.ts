import type {
  ButtonProps as AriaButtonProps,
  GroupProps as AriaGroupProps,
  InputProps as AriaInputProps,
  SearchFieldProps as AriaSearchFieldProps,
  ValidationResult as AriaValidationResult,
} from "react-aria-components";

export type SearchFieldProps = AriaSearchFieldProps;

export type SearchFieldInputProps = AriaInputProps;

export type SearchFieldGroupProps = AriaGroupProps;

export type SearchFieldClearProps = AriaButtonProps;

export interface FormSearchFieldProps extends AriaSearchFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
}
