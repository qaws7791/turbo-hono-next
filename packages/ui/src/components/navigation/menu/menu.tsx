"use client";

import { Check, ChevronRight, Circle } from "lucide-react";
import * as React from "react";
import {
  Header as AriaHeader,
  Keyboard as AriaKeyboard,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuTrigger as AriaMenuTrigger,
  Separator as AriaSeparator,
  SubmenuTrigger as AriaSubmenuTrigger,
  composeRenderProps,
} from "react-aria-components";

// TODO: Update imports once components are migrated
import { Button } from "../../button/button/button";
import { ListBoxCollection, ListBoxSection } from "../../../list-box";
import { SelectPopover } from "../../../select";
import { twMerge } from "../../../utils";

import type {
  JollyMenuProps,
  MenuHeaderProps,
  MenuItemProps,
  MenuKeyboardProps,
  MenuPopoverProps,
  MenuProps,
  MenuSeparatorProps,
} from "./menu.types";

/**
 * MenuTrigger - Triggers the menu display.
 * Re-exported from React Aria.
 */
const MenuTrigger = AriaMenuTrigger;

/**
 * MenuSubTrigger - Triggers a submenu.
 * Re-exported from React Aria.
 */
const MenuSubTrigger = AriaSubmenuTrigger;

/**
 * MenuSection - Groups related menu items.
 * Re-exported from ListBox components.
 */
const MenuSection = ListBoxSection;

/**
 * MenuCollection - Manages menu item collections.
 * Re-exported from ListBox components.
 */
const MenuCollection = ListBoxCollection;

/**
 * MenuPopover - Container for the menu overlay.
 *
 * @example
 * ```tsx
 * <MenuTrigger>
 *   <Button>Options</Button>
 *   <MenuPopover>
 *     <Menu>
 *       <MenuItem>Edit</MenuItem>
 *       <MenuItem>Delete</MenuItem>
 *     </Menu>
 *   </MenuPopover>
 * </MenuTrigger>
 * ```
 */
function MenuPopover({ className, ...props }: MenuPopoverProps) {
  return (
    <SelectPopover
      className={composeRenderProps(className, (className) =>
        twMerge("w-auto", className),
      )}
      {...props}
    />
  );
}

MenuPopover.displayName = "MenuPopover";

/**
 * Menu - The main menu container.
 *
 * @example
 * ```tsx
 * <Menu>
 *   <MenuItem onAction={() => console.log('Edit')}>Edit</MenuItem>
 *   <MenuItem onAction={() => console.log('Delete')}>Delete</MenuItem>
 * </Menu>
 * ```
 *
 * @example
 * With sections:
 * ```tsx
 * <Menu>
 *   <MenuSection>
 *     <MenuHeader>Actions</MenuHeader>
 *     <MenuItem>Edit</MenuItem>
 *     <MenuItem>Duplicate</MenuItem>
 *   </MenuSection>
 *   <MenuSeparator />
 *   <MenuSection>
 *     <MenuItem>Delete</MenuItem>
 *   </MenuSection>
 * </Menu>
 * ```
 */
const Menu = <T extends object>({ className, ...props }: MenuProps<T>) => (
  <AriaMenu
    className={composeRenderProps(className, (className) =>
      twMerge(
        "max-h-[inherit] overflow-auto rounded-md p-1 outline-0 [clip-path:inset(0_0_0_0_round_calc(var(--radius)-2px))]",
        className,
      ),
    )}
    {...props}
  />
);

Menu.displayName = "Menu";

/**
 * MenuItem - Individual menu item.
 * Supports selection modes, submenus, and keyboard shortcuts.
 *
 * @example
 * Basic:
 * ```tsx
 * <MenuItem onAction={() => alert('Clicked')}>
 *   Click me
 * </MenuItem>
 * ```
 *
 * @example
 * With keyboard shortcut:
 * ```tsx
 * <MenuItem>
 *   Save
 *   <MenuKeyboard>⌘S</MenuKeyboard>
 * </MenuItem>
 * ```
 *
 * @example
 * With submenu:
 * ```tsx
 * <MenuSubTrigger>
 *   <MenuItem>More options</MenuItem>
 *   <MenuPopover>
 *     <Menu>
 *       <MenuItem>Option 1</MenuItem>
 *       <MenuItem>Option 2</MenuItem>
 *     </Menu>
 *   </MenuPopover>
 * </MenuSubTrigger>
 * ```
 */
const MenuItem = ({ children, className, ...props }: MenuItemProps) => (
  <AriaMenuItem
    textValue={
      props.textValue || (typeof children === "string" ? children : undefined)
    }
    className={composeRenderProps(className, (className) =>
      twMerge(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        /* Disabled */
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        /* Focused */
        "data-[focused]:bg-accent data-[focused]:text-accent-foreground ",
        /* Selection Mode */
        "data-[selection-mode]:pl-8",
        className,
      ),
    )}
    {...props}
  >
    {composeRenderProps(children, (children, renderProps) => (
      <>
        <span className="absolute left-2 flex size-4 items-center justify-center">
          {renderProps.isSelected && (
            <>
              {renderProps.selectionMode == "single" && (
                <Circle className="size-2 fill-current" />
              )}
              {renderProps.selectionMode == "multiple" && (
                <Check className="size-4" />
              )}
            </>
          )}
        </span>

        {children}

        {renderProps.hasSubmenu && <ChevronRight className="ml-auto size-4" />}
      </>
    ))}
  </AriaMenuItem>
);

MenuItem.displayName = "MenuItem";

/**
 * MenuHeader - Section header within a menu.
 *
 * @example
 * ```tsx
 * <MenuSection>
 *   <MenuHeader>Actions</MenuHeader>
 *   <MenuItem>Edit</MenuItem>
 *   <MenuItem>Delete</MenuItem>
 * </MenuSection>
 * ```
 *
 * @example
 * Without separator:
 * ```tsx
 * <MenuHeader separator={false}>
 *   Header without border
 * </MenuHeader>
 * ```
 */
const MenuHeader = ({
  className,
  inset,
  separator = true,
  ...props
}: MenuHeaderProps) => (
  <AriaHeader
    className={twMerge(
      "px-3 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      separator && "-mx-1 mb-1 border-b border-b-border pb-2.5",
      className,
    )}
    {...props}
  />
);

MenuHeader.displayName = "MenuHeader";

/**
 * MenuSeparator - Visual separator between menu sections.
 *
 * @example
 * ```tsx
 * <Menu>
 *   <MenuItem>Action 1</MenuItem>
 *   <MenuSeparator />
 *   <MenuItem>Action 2</MenuItem>
 * </Menu>
 * ```
 */
const MenuSeparator = ({ className, ...props }: MenuSeparatorProps) => (
  <AriaSeparator
    className={twMerge("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
);

MenuSeparator.displayName = "MenuSeparator";

/**
 * MenuKeyboard - Displays keyboard shortcuts in menu items.
 *
 * @example
 * ```tsx
 * <MenuItem>
 *   Save
 *   <MenuKeyboard>⌘S</MenuKeyboard>
 * </MenuItem>
 * ```
 */
const MenuKeyboard = ({ className, ...props }: MenuKeyboardProps) => {
  return (
    <AriaKeyboard
      className={twMerge(
        "ml-auto text-xs tracking-widest opacity-60",
        className,
      )}
      {...props}
    />
  );
};

MenuKeyboard.displayName = "MenuKeyboard";

/**
 * JollyMenu - Convenience component combining trigger, button, and menu.
 * Provides a quick way to create button-triggered menus.
 *
 * @example
 * ```tsx
 * <JollyMenu label="Options" variant="outline">
 *   <MenuItem>Edit</MenuItem>
 *   <MenuItem>Delete</MenuItem>
 * </JollyMenu>
 * ```
 */
function JollyMenu<T extends object>({
  label,
  children,
  variant,
  size,
  ...props
}: JollyMenuProps<T>) {
  return (
    <MenuTrigger {...props}>
      <Button
        variant={variant}
        size={size}
      >
        {label}
      </Button>
      <MenuPopover className="min-w-[--trigger-width]">
        <Menu {...props}>{children}</Menu>
      </MenuPopover>
    </MenuTrigger>
  );
}

JollyMenu.displayName = "JollyMenu";

export {
  JollyMenu,
  Menu,
  MenuCollection,
  MenuHeader,
  MenuItem,
  MenuKeyboard,
  MenuPopover,
  MenuSection,
  MenuSeparator,
  MenuSubTrigger,
  MenuTrigger,
};
