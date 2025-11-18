/**
 * Common type definitions for all UI components
 */

/**
 * Base props that all components should support
 */
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;

  /** HTML id attribute */
  id?: string;

  /** Test identifier for automation */
  "data-testid"?: string;
}

/**
 * Props for components that support size variants
 */
export interface SizeProps {
  /** Component size */
  size?: "sm" | "md" | "lg" | "icon";
}

/**
 * Props for components that support visual variants
 */
export interface VariantProps<T extends string = string> {
  /** Visual variant of the component */
  variant?: T;
}

/**
 * Common size type used across components
 */
export type Size = "sm" | "md" | "lg" | "icon";

/**
 * Common button variant type
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";

/**
 * Common input variant type
 */
export type InputVariant = "default" | "ghost";
