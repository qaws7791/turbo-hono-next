import type { ButtonProps as AriaButtonProps } from "react-aria-components";
import type { VariantProps } from "tailwind-variants";
import type { buttonStyles } from "./button.styles";

/**
 * Button component variant props
 */
export type ButtonVariantProps = VariantProps<typeof buttonStyles>;

/**
 * Button component props
 */
export interface ButtonProps extends AriaButtonProps, ButtonVariantProps {
  /**
   * Button visual variant
   * @default 'primary'
   *
   * - `primary`: Main action (e.g., Submit, Save)
   * - `secondary`: Secondary action
   * - `destructive`: Dangerous action (e.g., Delete)
   * - `outline`: Less important action
   * - `ghost`: Minimal style
   * - `link`: Link-styled button
   */
  variant?: ButtonVariantProps["variant"];

  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonVariantProps["size"];
}
