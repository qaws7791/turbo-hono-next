"use client";

import * as React from "react";
import { composeRenderProps } from "react-aria-components";

// TODO: Update imports once button and text-field components are migrated
import { cn } from "../../../utils";
import { Button } from "../../button/button/button";
import { Input, TextArea } from "../text-field/text-field";

import {
  inputGroupAddonVariants,
  inputGroupButtonVariants,
} from "./input-group.styles";

import type {
  InputGroupAddonProps,
  InputGroupButtonProps,
  InputGroupInputProps,
  InputGroupProps,
  InputGroupTextProps,
  InputGroupTextareaProps,
} from "./input-group.types";

/**
 * InputGroup - Container for grouping input controls with addons.
 * Supports inline and block alignments, focus states, and error states.
 *
 * @example
 * Basic usage with addon:
 * ```tsx
 * <InputGroup>
 *   <InputGroupAddon>$</InputGroupAddon>
 *   <InputGroupInput placeholder="Amount" />
 * </InputGroup>
 * ```
 *
 * @example
 * With button:
 * ```tsx
 * <InputGroup>
 *   <InputGroupInput placeholder="Search..." />
 *   <InputGroupAddon align="inline-end">
 *     <InputGroupButton>
 *       <SearchIcon />
 *     </InputGroupButton>
 *   </InputGroupAddon>
 * </InputGroup>
 * ```
 */
function InputGroup({ className, ...props }: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group border-input dark:bg-input/30 relative flex w-full items-center rounded-md border shadow-xs transition-[color,box-shadow] outline-none",
        "h-9 min-w-0 has-[>textarea]:h-auto",

        // Variants based on alignment.
        "has-[>[data-align=inline-start]]:[&>input]:pl-2",
        "has-[>[data-align=inline-end]]:[&>input]:pr-2",
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",

        // Focus state.
        "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]",

        // Error state.
        "has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",

        className,
      )}
      {...props}
    />
  );
}

InputGroup.displayName = "InputGroup";

/**
 * InputGroupAddon - Supplementary content for the input group.
 * Can contain text, icons, buttons, or keyboard shortcuts.
 *
 * @example
 * Icon addon:
 * ```tsx
 * <InputGroupAddon>
 *   <SearchIcon />
 * </InputGroupAddon>
 * ```
 *
 * @example
 * Text addon:
 * ```tsx
 * <InputGroupAddon align="inline-end">
 *   <InputGroupText>.com</InputGroupText>
 * </InputGroupAddon>
 * ```
 */
function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: InputGroupAddonProps) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus();
      }}
      {...props}
    />
  );
}

InputGroupAddon.displayName = "InputGroupAddon";

/**
 * InputGroupButton - A button component optimized for input groups.
 * Automatically sized to fit within the input group.
 *
 * @example
 * ```tsx
 * <InputGroupButton>
 *   <SearchIcon />
 *   Search
 * </InputGroupButton>
 * ```
 *
 * @example
 * Icon-only button:
 * ```tsx
 * <InputGroupButton size="icon-xs">
 *   <CloseIcon />
 * </InputGroupButton>
 * ```
 */
function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: InputGroupButtonProps) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={composeRenderProps(className, (className, renderProps) =>
        inputGroupButtonVariants({ ...renderProps, size, className }),
      )}
      {...props}
    />
  );
}

InputGroupButton.displayName = "InputGroupButton";

/**
 * InputGroupText - Static text within the input group addon.
 *
 * @example
 * ```tsx
 * <InputGroupAddon>
 *   <InputGroupText>@</InputGroupText>
 * </InputGroupAddon>
 * ```
 */
function InputGroupText({ className, ...props }: InputGroupTextProps) {
  return (
    <span
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

InputGroupText.displayName = "InputGroupText";

/**
 * InputGroupInput - The main input field within the group.
 * Styled to integrate seamlessly with the group container.
 *
 * @example
 * ```tsx
 * <InputGroup>
 *   <InputGroupInput
 *     placeholder="Enter text..."
 *     type="text"
 *   />
 * </InputGroup>
 * ```
 */
function InputGroupInput({ className, ...props }: InputGroupInputProps) {
  return (
    <Input
      data-slot="input-group-control"
      className={composeRenderProps(className, (className) =>
        cn(
          "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
          className,
        ),
      )}
      {...props}
    />
  );
}

InputGroupInput.displayName = "InputGroupInput";

/**
 * InputGroupTextarea - A textarea field within the group.
 * Automatically adjusts the group height to accommodate multiple lines.
 *
 * @example
 * ```tsx
 * <InputGroup>
 *   <InputGroupAddon align="block-start">
 *     <InputGroupText>Description</InputGroupText>
 *   </InputGroupAddon>
 *   <InputGroupTextarea
 *     placeholder="Enter description..."
 *     rows={4}
 *   />
 * </InputGroup>
 * ```
 */
const InputGroupTextarea = React.forwardRef<
  HTMLTextAreaElement,
  InputGroupTextareaProps
>(({ className, ...props }, ref) => {
  return (
    <TextArea
      ref={ref}
      data-slot="input-group-control"
      className={composeRenderProps(className, (className) =>
        cn(
          "flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none data-[focused]:ring-0 dark:bg-transparent",
          className,
        ),
      )}
      {...props}
    />
  );
});

InputGroupTextarea.displayName = "InputGroupTextarea";

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
};
