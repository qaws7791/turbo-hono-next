import type { ReactNode } from "react";
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

  /**
   * Whether the button should take the full width of its parent
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Whether the button should have the same width and height (square)
   * @default false
   */
  isIconOnly?: boolean;

  /**
   * Whether the button is in loading state
   * When true, the button is disabled and shows a loading indicator
   * @default false
   */
  isLoading?: boolean;

  /**
   * Fallback content to display when loading
   * @default LoadingSpinner
   */
  loadingFallback?: ReactNode;
}
