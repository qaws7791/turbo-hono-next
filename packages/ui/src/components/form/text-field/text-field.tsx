"use client";

import { forwardRef } from "react";
import {
  Input as AriaInput,
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  Text,
  composeRenderProps,
} from "react-aria-components";

import { inputVariants, textAreaVariants } from "../../../styles/variants";
import { cn } from "../../../utils";
import { FieldError } from "../field-error";
import { Label } from "../label";

import type {
  FormTextFieldProps,
  InputProps,
  TextAreaProps,
  TextFieldProps,
} from "./text-field.types";

/**
 * TextField component
 *
 * @description
 * A container for text input. Built on React Aria Components for accessibility.
 *
 * @example
 * Basic usage
 * ```tsx
 * <TextField>
 *   <Label>Username</Label>
 *   <Input />
 * </TextField>
 * ```
 */
export function TextField(props: TextFieldProps) {
  return <AriaTextField {...props} />;
}

TextField.displayName = "TextField";

/**
 * Input component
 *
 * @description
 * A single-line text input field. Built on React Aria Components for accessibility.
 *
 * @example
 * Basic usage
 * ```tsx
 * <Input placeholder="Enter text..." />
 * ```
 *
 * @example
 * With custom styling
 * ```tsx
 * <Input className="h-12" type="email" />
 * ```
 */
export function Input({ className, ...props }: InputProps) {
  return (
    <AriaInput
      className={composeRenderProps(className, (className, renderProps) =>
        inputVariants({ ...renderProps, className }),
      )}
      {...props}
    />
  );
}

Input.displayName = "Input";

/**
 * TextArea component
 *
 * @description
 * A multi-line text input field. Built on React Aria Components for accessibility.
 *
 * @example
 * Basic usage
 * ```tsx
 * <TextArea placeholder="Enter your message..." />
 * ```
 *
 * @example
 * With custom minimum height
 * ```tsx
 * <TextArea className="min-h-[120px]" />
 * ```
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <AriaTextArea
        ref={ref}
        className={composeRenderProps(className, (className, renderProps) =>
          textAreaVariants({ ...renderProps, className }),
        )}
        {...props}
      />
    );
  },
);

TextArea.displayName = "TextArea";

/**
 * FormTextField component
 *
 * @description
 * A complete text field with label, input/textarea, description, and error message.
 * Built on React Aria Components for accessibility.
 *
 * @example
 * Basic usage
 * ```tsx
 * <FormTextField
 *   label="Username"
 *   description="Choose a unique username"
 *   errorMessage="Username is required"
 * />
 * ```
 *
 * @example
 * As a textarea
 * ```tsx
 * <FormTextField
 *   label="Bio"
 *   description="Tell us about yourself"
 *   textArea
 * />
 * ```
 */
export function FormTextField({
  label,
  description,
  errorMessage,
  textArea,
  placeholder,
  type,
  className,
  ...props
}: FormTextFieldProps) {
  return (
    <AriaTextField
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className),
      )}
      {...props}
    >
      {label && <Label>{label}</Label>}
      {textArea ? (
        <TextArea placeholder={placeholder} />
      ) : (
        <Input
          placeholder={placeholder}
          type={type}
        />
      )}
      {description && (
        <Text
          className="text-sm text-muted-foreground"
          slot="description"
        >
          {description}
        </Text>
      )}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}

FormTextField.displayName = "FormTextField";
