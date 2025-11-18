import type { ProgressBarProps as AriaProgressBarProps } from "react-aria-components";

/**
 * Base props for the Progress component.
 */
export interface ProgressProps extends AriaProgressBarProps {
  /** Custom className for the progress bar container */
  barClassName?: string;
  /** Custom className for the fill/indicator */
  fillClassName?: string;
}

/**
 * Props for FormProgressBar with label and value display.
 */
export interface FormProgressBarProps extends ProgressProps {
  /** Label text for the progress bar */
  label?: string;
  /** Whether to show the value text (e.g., "50%") */
  showValue?: boolean;
}
