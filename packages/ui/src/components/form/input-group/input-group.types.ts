import type { InputProps, TextAreaProps } from "react-aria-components";
import type { ComponentProps } from "react";
import type { VariantProps } from "tailwind-variants";
import type { Button } from "../../button/button/button";
import type {
  inputGroupAddonStyles,
  inputGroupButtonStyles,
} from "./input-group.styles";

/**
 * Props for the InputGroup container.
 * Groups input controls with addons, buttons, or text.
 */
export type InputGroupProps = ComponentProps<"div">;

/**
 * Props for InputGroupAddon.
 * Displays supplementary content alongside the input.
 */
export type InputGroupAddonProps = ComponentProps<"div"> &
  VariantProps<typeof inputGroupAddonStyles>;

/**
 * Props for InputGroupButton.
 * A button that appears inside the input group.
 */
export type InputGroupButtonProps = Omit<
  ComponentProps<typeof Button>,
  "size"
> &
  VariantProps<typeof inputGroupButtonStyles>;

/**
 * Props for InputGroupText.
 * Static text content within the input group.
 */
export type InputGroupTextProps = ComponentProps<"span">;

/**
 * Props for InputGroupInput.
 * The main input field within the group.
 */
export type InputGroupInputProps = InputProps;

/**
 * Props for InputGroupTextarea.
 * A textarea field within the group.
 */
export type InputGroupTextareaProps = TextAreaProps;
