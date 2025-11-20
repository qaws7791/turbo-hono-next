import type * as React from "react";
import type {
  DialogProps as AriaDialogProps,
  DialogTriggerProps as AriaDialogTriggerProps,
  HeadingProps as AriaHeadingProps,
  ModalOverlayProps as AriaModalOverlayProps,
} from "react-aria-components";
import type { VariantProps } from "tailwind-variants";
import type { sheetStyles } from "./dialog.styles";

/**
 * Dialog component props
 */
export type DialogProps = AriaDialogProps;

/**
 * DialogTrigger component props
 */
export type DialogTriggerProps = AriaDialogTriggerProps;

/**
 * DialogOverlay component props
 */
export type DialogOverlayProps = AriaModalOverlayProps;

/**
 * Sheet variant props
 */
export type SheetVariantProps = VariantProps<typeof sheetStyles>;

/**
 * DialogContent component props
 */
export interface DialogContentProps
  extends Omit<React.ComponentProps<"div">, "children">,
    SheetVariantProps {
  /**
   * Dialog content (can be a render function)
   */
  children?: AriaDialogProps["children"];

  /**
   * Dialog role for accessibility
   */
  role?: AriaDialogProps["role"];

  /**
   * Whether to show the close button
   * @default true
   */
  closeButton?: boolean;

  /**
   * Side position for sheet variant
   * - `top`: Sheet slides from top
   * - `bottom`: Sheet slides from bottom
   * - `left`: Sheet slides from left
   * - `right`: Sheet slides from right
   */
  side?: SheetVariantProps["side"];
}

/**
 * DialogHeader component props
 */
export type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * DialogFooter component props
 */
export type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * DialogTitle component props
 */
export type DialogTitleProps = AriaHeadingProps;

/**
 * DialogDescription component props
 */
export type DialogDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;
