import type { VariantProps } from "tailwind-variants";
import type { toastStyles } from "./toast.styles";

export type ToastStylesProps = VariantProps<typeof toastStyles>;

/**
 * Toast content interface for queue
 */
export interface ToastContent {
  /** Title of the toast */
  title?: string;
  /** Description text for the toast */
  description?: string;
  /** Visual variant of the toast */
  variant?: ToastStylesProps["variant"];
  /** Optional action button configuration */
  action?: {
    /** Label text for the action button */
    label: string;
    /** Click handler for the action button */
    onClick: () => void;
  };
}
