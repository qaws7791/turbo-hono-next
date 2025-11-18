import type {
  ListBoxItemProps as AriaListBoxItemProps,
  ListBoxProps as AriaListBoxProps,
} from "react-aria-components";
import type { ComponentProps } from "react";

/**
 * Props for the ListBox component.
 */
export type ListBoxProps<T extends object> = AriaListBoxProps<T>;

/**
 * Props for the ListBoxItem component.
 */
export type ListBoxItemProps<T extends object> = AriaListBoxItemProps<T>;

/**
 * Props for the ListBoxHeader component.
 */
export type ListBoxHeaderProps = ComponentProps<"header">;
