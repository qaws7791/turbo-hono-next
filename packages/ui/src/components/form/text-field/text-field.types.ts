import type {
  InputProps as AriaInputProps,
  TextAreaProps as AriaTextAreaProps,
  TextFieldProps as AriaTextFieldProps,
  ValidationResult as AriaValidationResult,
} from "react-aria-components";

/**
 * TextField component props
 */
export type TextFieldProps = AriaTextFieldProps;

/**
 * Input component props
 */
export type InputProps = AriaInputProps;

/**
 * TextArea component props
 */
export type TextAreaProps = AriaTextAreaProps;

/**
 * FormTextField component props
 * A complete text field with label, input/textarea, description, and error
 */
export interface FormTextFieldProps extends AriaTextFieldProps {
  /**
   * Label text for the field
   */
  label?: string;

  /**
   * Description text to help users
   */
  description?: string;

  /**
   * Error message to display when validation fails
   */
  errorMessage?: string | ((validation: AriaValidationResult) => string);

  /**
   * Whether to render as a textarea instead of input
   * @default false
   */
  textArea?: boolean;

  /**
   * Placeholder text for the input/textarea
   */
  placeholder?: string;

  /**
   * Input type (text, email, password, number, etc.)
   * Only applies when textArea is false
   */
  type?: string;
}
