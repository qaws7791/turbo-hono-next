"use client";

import { Check } from "lucide-react";
import {
  Collection as AriaCollection,
  Header as AriaHeader,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  ListBoxSection as AriaListBoxSection,
  composeRenderProps,
} from "react-aria-components";

import { twMerge } from "../../../utils";

import type {
  ListBoxHeaderProps,
  ListBoxItemProps,
  ListBoxProps,
} from "./list-box.types";

/**
 * ListBoxSection - Re-exported from React Aria.
 * Used for grouping list items.
 */
const ListBoxSection = AriaListBoxSection;

/**
 * ListBoxCollection - Re-exported from React Aria.
 * Used for managing collections of items.
 */
const ListBoxCollection = AriaCollection;

/**
 * ListBox - Accessible list component with selection support.
 * Supports single and multiple selection modes.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <ListBox>
 *   <ListBoxItem>Option 1</ListBoxItem>
 *   <ListBoxItem>Option 2</ListBoxItem>
 *   <ListBoxItem>Option 3</ListBoxItem>
 * </ListBox>
 * ```
 *
 * @example
 * With selection:
 * ```tsx
 * <ListBox
 *   selectionMode="multiple"
 *   onSelectionChange={(keys) => console.log(keys)}
 * >
 *   <ListBoxItem id="1">Item 1</ListBoxItem>
 *   <ListBoxItem id="2">Item 2</ListBoxItem>
 *   <ListBoxItem id="3">Item 3</ListBoxItem>
 * </ListBox>
 * ```
 *
 * @example
 * With sections:
 * ```tsx
 * <ListBox>
 *   <ListBoxSection>
 *     <ListBoxHeader>Group 1</ListBoxHeader>
 *     <ListBoxItem>Item 1</ListBoxItem>
 *     <ListBoxItem>Item 2</ListBoxItem>
 *   </ListBoxSection>
 *   <ListBoxSection>
 *     <ListBoxHeader>Group 2</ListBoxHeader>
 *     <ListBoxItem>Item 3</ListBoxItem>
 *     <ListBoxItem>Item 4</ListBoxItem>
 *   </ListBoxSection>
 * </ListBox>
 * ```
 */
function ListBox<T extends object>({ className, ...props }: ListBoxProps<T>) {
  return (
    <AriaListBox
      className={composeRenderProps(className, (className) =>
        twMerge(
          className,
          "group overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none",
          /* Empty */
          "data-[empty]:p-6 data-[empty]:text-center data-[empty]:text-sm",
        ),
      )}
      {...props}
    />
  );
}

ListBox.displayName = "ListBox";

/**
 * ListBoxItem - Individual item in the list.
 * Shows a check icon when selected.
 *
 * @example
 * Basic item:
 * ```tsx
 * <ListBoxItem id="item1">
 *   Item 1
 * </ListBoxItem>
 * ```
 *
 * @example
 * Disabled item:
 * ```tsx
 * <ListBoxItem id="item2" isDisabled>
 *   Disabled item
 * </ListBoxItem>
 * ```
 *
 * @example
 * With custom content:
 * ```tsx
 * <ListBoxItem id="user1">
 *   <div className="flex items-center gap-2">
 *     <Avatar src={user.avatar} />
 *     <span>{user.name}</span>
 *   </div>
 * </ListBoxItem>
 * ```
 */
const ListBoxItem = <T extends object>({
  className,
  children,
  ...props
}: ListBoxItemProps<T>) => {
  return (
    <AriaListBoxItem
      textValue={
        props.textValue || (typeof children === "string" ? children : undefined)
      }
      className={composeRenderProps(className, (className) =>
        twMerge(
          "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none",
          /* Disabled */
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          /* Focused */
          "data-[focused]:bg-accent data-[focused]:text-accent-foreground",
          /* Hovered */
          "data-[hovered]:bg-accent data-[hovered]:text-accent-foreground",
          /* Selection */
          "data-[selection-mode]:pl-8",
          className,
        ),
      )}
      {...props}
    >
      {composeRenderProps(children, (children, renderProps) => (
        <>
          {renderProps.isSelected && (
            <span className="absolute left-2 flex size-4 items-center justify-center">
              <Check className="size-4" />
            </span>
          )}
          {children}
        </>
      ))}
    </AriaListBoxItem>
  );
};

ListBoxItem.displayName = "ListBoxItem";

/**
 * ListBoxHeader - Header for a list section.
 *
 * @example
 * ```tsx
 * <ListBoxSection>
 *   <ListBoxHeader>Recent Items</ListBoxHeader>
 *   <ListBoxItem>Item 1</ListBoxItem>
 *   <ListBoxItem>Item 2</ListBoxItem>
 * </ListBoxSection>
 * ```
 */
function ListBoxHeader({ className, ...props }: ListBoxHeaderProps) {
  return (
    <AriaHeader
      className={twMerge("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
      {...props}
    />
  );
}

ListBoxHeader.displayName = "ListBoxHeader";

export {
  ListBox,
  ListBoxCollection,
  ListBoxHeader,
  ListBoxItem,
  ListBoxSection,
};
