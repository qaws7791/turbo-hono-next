"use client";

import { ChevronDown } from "lucide-react";
import {
  Button as AriaButton,
  ListBox as AriaListBox,
  Select as AriaSelect,
  SelectValue as AriaSelectValue,
  Text,
  composeRenderProps,
} from "react-aria-components";

import { FieldError, Label } from "..";
import {
  ListBoxCollection,
  ListBoxHeader,
  ListBoxItem,
  ListBoxSection,
} from "../../../components/interaction/list-box";
import { Popover } from "../../../components/overlay/popover";
import { cn } from "../../../utils";

import type {
  FormSelectProps,
  SelectListBoxProps,
  SelectPopoverProps,
  SelectTriggerProps,
  SelectValueProps,
} from "./select.types";

/**
 * Select component - Base select wrapper
 *
 * @example
 * ```tsx
 * <Select>
 *   <SelectTrigger>
 *     <SelectValue />
 *   </SelectTrigger>
 *   <SelectPopover>
 *     <SelectListBox>
 *       <SelectItem>Option 1</SelectItem>
 *     </SelectListBox>
 *   </SelectPopover>
 * </Select>
 * ```
 */
const Select = AriaSelect;

/**
 * SelectItem component - Individual option in select dropdown
 */
const SelectItem = ListBoxItem;

/**
 * SelectHeader component - Section header in select dropdown
 */
const SelectHeader = ListBoxHeader;

/**
 * SelectSection component - Group of options in select dropdown
 */
const SelectSection = ListBoxSection;

/**
 * SelectCollection component - Collection wrapper for dynamic items
 */
const SelectCollection = ListBoxCollection;

/**
 * SelectValue component - Displays selected value
 *
 * @example
 * ```tsx
 * <SelectValue placeholder="Choose an option" />
 * ```
 */
const SelectValue = <T extends object>({
  className,
  ...props
}: SelectValueProps<T>) => (
  <AriaSelectValue
    className={composeRenderProps(className, (className) =>
      cn(
        "line-clamp-1 data-[placeholder]:text-muted-foreground",
        /* Description */
        "[&>[slot=description]]:hidden",
        className,
      ),
    )}
    {...props}
  />
);

/**
 * SelectTrigger component - Button that opens the select dropdown
 *
 * @example
 * ```tsx
 * <SelectTrigger>
 *   <SelectValue />
 * </SelectTrigger>
 * ```
 */
const SelectTrigger = ({
  className,
  children,
  ...props
}: SelectTriggerProps) => (
  <AriaButton
    className={composeRenderProps(className, (className) =>
      cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        /* Disabled */
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        /* Focused */
        "data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2",
        /* Resets */
        "focus-visible:outline-none",
        className,
      ),
    )}
    {...props}
  >
    {composeRenderProps(children, (children) => (
      <>
        {children}
        <ChevronDown
          aria-hidden="true"
          className="size-4 opacity-50"
        />
      </>
    ))}
  </AriaButton>
);

/**
 * SelectPopover component - Popover container for select dropdown
 *
 * @example
 * ```tsx
 * <SelectPopover>
 *   <SelectListBox>
 *     <SelectItem>Option</SelectItem>
 *   </SelectListBox>
 * </SelectPopover>
 * ```
 */
const SelectPopover = ({ className, ...props }: SelectPopoverProps) => (
  <Popover
    className={composeRenderProps(className, (className) =>
      cn("min-w-(--trigger-width)", className),
    )}
    {...props}
  />
);

/**
 * SelectListBox component - List container for select options
 *
 * @example
 * ```tsx
 * <SelectListBox>
 *   <SelectItem>Option 1</SelectItem>
 *   <SelectItem>Option 2</SelectItem>
 * </SelectListBox>
 * ```
 */
const SelectListBox = <T extends object>({
  className,
  ...props
}: SelectListBoxProps<T>) => (
  <AriaListBox
    className={composeRenderProps(className, (className) =>
      cn(
        "max-h-[inherit] overflow-auto p-1 outline-none [clip-path:inset(0_0_0_0_round_calc(var(--radius)-2px))]",
        className,
      ),
    )}
    {...props}
  />
);

/**
 * FormSelect component - Select with label, description and error message
 *
 * @example
 * ```tsx
 * <FormSelect
 *   label="Choose an option"
 *   description="Select from the list"
 *   errorMessage="Selection is required"
 * >
 *   <SelectItem>Option 1</SelectItem>
 *   <SelectItem>Option 2</SelectItem>
 * </FormSelect>
 * ```
 */
function FormSelect<T extends object>({
  label,
  description,
  errorMessage,
  children,
  className,
  items,
  ...props
}: FormSelectProps<T>) {
  return (
    <Select
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className),
      )}
      {...props}
    >
      <Label>{label}</Label>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      {description && (
        <Text
          className="text-sm text-muted-foreground"
          slot="description"
        >
          {description}
        </Text>
      )}
      <FieldError>{errorMessage}</FieldError>
      <SelectPopover>
        <SelectListBox items={items}>{children}</SelectListBox>
      </SelectPopover>
    </Select>
  );
}

export {
  FormSelect,
  Select,
  SelectCollection,
  SelectHeader,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectSection,
  SelectTrigger,
  SelectValue,
};
