import type { ComponentProps } from "react";
import type {
  MenuItemProps as AriaMenuItemProps,
  MenuProps as AriaMenuProps,
  MenuTriggerProps as AriaMenuTriggerProps,
  SeparatorProps as AriaSeparatorProps,
  PopoverProps,
} from "react-aria-components";
import type { VariantProps } from "tailwind-variants";
import type { buttonStyles } from "../../button/button/button.styles";

/**
 * Props for the MenuTrigger component.
 */
export type MenuTriggerProps = AriaMenuTriggerProps;

/**
 * Props for the MenuPopover component.
 */
export type MenuPopoverProps = PopoverProps;

/**
 * Props for the Menu component.
 */
export type MenuProps<T extends object> = AriaMenuProps<T>;

/**
 * Props for the MenuItem component.
 */
export type MenuItemProps = AriaMenuItemProps;

/**
 * Props for the MenuHeader component.
 */
export interface MenuHeaderProps extends ComponentProps<"header"> {
  inset?: boolean;
  separator?: boolean;
}

/**
 * Props for the MenuSeparator component.
 */
export type MenuSeparatorProps = AriaSeparatorProps;

/**
 * Props for the MenuKeyboard component (keyboard shortcut display).
 */
export type MenuKeyboardProps = ComponentProps<"kbd">;

/**
 * Props for the JollyMenu compound component.
 */
export interface JollyMenuProps<T>
  extends AriaMenuProps<T>,
    VariantProps<typeof buttonStyles>,
    Omit<AriaMenuTriggerProps, "children"> {
  label?: string;
}
