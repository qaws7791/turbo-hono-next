"use client";

import { Circle } from "lucide-react";
import {
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  Text,
  composeRenderProps,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";

import { FieldError, Label } from "..";

import {
  radioGroupStyles,
  radioInnerStyles,
  radioStyles,
} from "./radio-group.styles";

import type {
  FormRadioGroupProps,
  RadioGroupProps,
  RadioProps,
} from "./radio-group.types";

/**
 * RadioGroup component - Groups radio buttons for single selection
 *
 * @example
 * ```tsx
 * <RadioGroup value="option1" onChange={setValue}>
 *   <Radio value="option1">Option 1</Radio>
 *   <Radio value="option2">Option 2</Radio>
 * </RadioGroup>
 * ```
 */
const RadioGroup = ({ className, ...props }: RadioGroupProps) => {
  return (
    <AriaRadioGroup
      className={composeRenderProps(className, (className, renderProps) =>
        radioGroupStyles({ className, orientation: renderProps.orientation }),
      )}
      {...props}
    />
  );
};

/**
 * Radio component - Single radio button option
 *
 * @example
 * ```tsx
 * <Radio value="option1">
 *   Select this option
 * </Radio>
 * ```
 */
const Radio = ({ className, children, ...props }: RadioProps) => {
  return (
    <AriaRadio
      className={composeRenderProps(className, (className) =>
        radioStyles({ className }),
      )}
      {...props}
    >
      {composeRenderProps(children, (children, renderProps) => (
        <>
          <span className={radioInnerStyles()}>
            {renderProps.isSelected && (
              <Circle className="size-2.5 fill-current text-current" />
            )}
          </span>
          {children}
        </>
      ))}
    </AriaRadio>
  );
};

/**
 * FormRadioGroup component - Radio group with label, description and error message
 *
 * @example
 * ```tsx
 * <FormRadioGroup
 *   label="Choose an option"
 *   description="Select one option"
 *   errorMessage="An option is required"
 * >
 *   <Radio value="option1">Option 1</Radio>
 *   <Radio value="option2">Option 2</Radio>
 * </FormRadioGroup>
 * ```
 */
function FormRadioGroup({
  label,
  description,
  className,
  errorMessage,
  children,
  ...props
}: FormRadioGroupProps) {
  return (
    <RadioGroup
      className={composeRenderProps(className, (className) =>
        twMerge("group/radiogroup flex-col items-start", className),
      )}
      {...props}
    >
      {composeRenderProps(children, (children) => (
        <>
          <Label>{label}</Label>
          <div className="flex flex-col flex-wrap gap-2 group-data-[orientation=horizontal]/radiogroup:flex-row">
            {children}
          </div>
          {description && (
            <Text
              slot="description"
              className="text-sm text-muted-foreground"
            >
              {description}
            </Text>
          )}
          <FieldError>{errorMessage}</FieldError>
        </>
      ))}
    </RadioGroup>
  );
}

export { FormRadioGroup, Radio, RadioGroup };
