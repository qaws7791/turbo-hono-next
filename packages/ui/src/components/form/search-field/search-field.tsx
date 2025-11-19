"use client";

import { SearchIcon, XIcon } from "lucide-react";
import {
  Button as AriaButton,
  Group as AriaGroup,
  Input as AriaInput,
  SearchField as AriaSearchField,
  Text,
  composeRenderProps,
} from "react-aria-components";

import { FieldError, FieldGroup, Label } from "..";
import { cn } from "../../../utils";

import {
  searchFieldClearStyles,
  searchFieldGroupStyles,
  searchFieldInputStyles,
} from "./search-field.styles";

import type {
  FormSearchFieldProps,
  SearchFieldClearProps,
  SearchFieldGroupProps,
  SearchFieldInputProps,
  SearchFieldProps,
} from "./search-field.types";

/**
 * SearchField component - Base search input with clear button
 *
 * @example
 * ```tsx
 * <SearchField value={query} onChange={setQuery}>
 *   <Label>Search</Label>
 *   <SearchFieldGroup>
 *     <SearchIcon />
 *     <SearchFieldInput />
 *     <SearchFieldClear>
 *       <XIcon />
 *     </SearchFieldClear>
 *   </SearchFieldGroup>
 * </SearchField>
 * ```
 */
function SearchField({ className, ...props }: SearchFieldProps) {
  return (
    <AriaSearchField
      className={composeRenderProps(className, (className) =>
        cn(className, "group"),
      )}
      {...props}
    />
  );
}

/**
 * SearchFieldInput component - Text input for search query
 *
 * @example
 * ```tsx
 * <SearchFieldInput placeholder="Search..." />
 * ```
 */
function SearchFieldInput({ className, ...props }: SearchFieldInputProps) {
  return (
    <AriaInput
      className={composeRenderProps(className, (className) =>
        searchFieldInputStyles({ className }),
      )}
      {...props}
    />
  );
}

/**
 * SearchFieldGroup component - Container for search input and buttons
 *
 * @example
 * ```tsx
 * <SearchFieldGroup>
 *   <SearchIcon />
 *   <SearchFieldInput />
 *   <SearchFieldClear>
 *     <XIcon />
 *   </SearchFieldClear>
 * </SearchFieldGroup>
 * ```
 */
function SearchFieldGroup({ className, ...props }: SearchFieldGroupProps) {
  return (
    <AriaGroup
      className={composeRenderProps(className, (className) =>
        searchFieldGroupStyles({ className }),
      )}
      {...props}
    />
  );
}

/**
 * SearchFieldClear component - Button to clear search input
 *
 * @example
 * ```tsx
 * <SearchFieldClear>
 *   <XIcon className="size-4" />
 * </SearchFieldClear>
 * ```
 */
function SearchFieldClear({ className, ...props }: SearchFieldClearProps) {
  return (
    <AriaButton
      className={composeRenderProps(className, (className) =>
        searchFieldClearStyles({ className }),
      )}
      {...props}
    />
  );
}

/**
 * FormSearchField component - Search field with label, description and error message
 *
 * @example
 * ```tsx
 * <FormSearchField
 *   label="Search products"
 *   description="Enter keywords to search"
 *   errorMessage="Invalid search query"
 * />
 * ```
 */
function FormSearchField({
  label,
  description,
  className,
  errorMessage,
  ...props
}: FormSearchFieldProps) {
  return (
    <SearchField
      className={composeRenderProps(className, (className) =>
        cn(className, "group flex flex-col gap-2"),
      )}
      {...props}
    >
      <Label>{label}</Label>
      <FieldGroup>
        <SearchIcon
          aria-hidden
          className="size-4 text-muted-foreground"
        />
        <SearchFieldInput placeholder="Search..." />
        <SearchFieldClear>
          <XIcon
            aria-hidden
            className="size-4"
          />
        </SearchFieldClear>
      </FieldGroup>
      {description && (
        <Text
          className="text-sm text-muted-foreground"
          slot="description"
        >
          {description}
        </Text>
      )}
      <FieldError>{errorMessage}</FieldError>
    </SearchField>
  );
}

export {
  FormSearchField,
  SearchField,
  SearchFieldClear,
  SearchFieldGroup,
  SearchFieldInput,
};
