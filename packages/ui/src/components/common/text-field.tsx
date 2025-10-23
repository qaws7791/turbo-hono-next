"use client";

import {
  Input as AriaInput,
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  Text,
  composeRenderProps,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

import { focusRing } from "../../utils";

import { FieldError, Label } from "./form";

import type {
  InputProps as AriaInputProps,
  TextAreaProps as AriaTextAreaProps,
  TextFieldProps as AriaTextFieldProps,
  ValidationResult as AriaValidationResult,
} from "react-aria-components";

const TextField = AriaTextField;

const inputStyles = tv({
  extend: focusRing,
  base: [
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
    /* File */
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
    /* Placeholder */
    "placeholder:text-muted-foreground",
    /* Disabled */
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  ],
});

const Input = ({ className, ...props }: AriaInputProps) => {
  return (
    <AriaInput
      className={composeRenderProps(className, (className, renderProps) =>
        inputStyles({ ...renderProps, className }),
      )}
      {...props}
    />
  );
};

const textAreaStyles = tv({
  extend: focusRing,
  base: [
    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
    /* Placeholder */
    "placeholder:text-muted-foreground",
    /* Disabled */
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  ],
});

const TextArea = ({ className, ...props }: AriaTextAreaProps) => {
  return (
    <AriaTextArea
      className={composeRenderProps(className, (className, renderProps) =>
        textAreaStyles({ ...renderProps, className }),
      )}
      {...props}
    />
  );
};

interface FormTextFieldProps extends AriaTextFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
  textArea?: boolean;
}

function FormTextField({
  label,
  description,
  errorMessage,
  textArea,
  className,
  ...props
}: FormTextFieldProps) {
  return (
    <AriaTextField
      className={composeRenderProps(className, (className) =>
        twMerge("group flex flex-col gap-2", className),
      )}
      {...props}
    >
      <Label>{label}</Label>
      {textArea ? <TextArea /> : <Input />}
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

export { FormTextField, Input, TextArea, TextField };
export type { FormTextFieldProps };
