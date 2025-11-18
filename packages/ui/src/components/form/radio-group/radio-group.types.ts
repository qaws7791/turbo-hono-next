import type {
  RadioGroupProps as AriaRadioGroupProps,
  RadioProps as AriaRadioProps,
  ValidationResult as AriaValidationResult,
} from "react-aria-components";

export type RadioProps = AriaRadioProps;

export type RadioGroupProps = AriaRadioGroupProps;

export interface FormRadioGroupProps extends AriaRadioGroupProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
}
