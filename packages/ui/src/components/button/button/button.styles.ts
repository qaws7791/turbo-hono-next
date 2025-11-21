import { tv } from "tailwind-variants";

import { focusVisibleRing } from "../../../utils/focus-ring";

import type { VariantProps } from "tailwind-variants";

/**
 * Button component style variants
 * Used by Button and other interactive components that need button-like styling
 */
export const buttonStyles = tv({
  extend: focusVisibleRing,
  base: [
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors",
    /* Disabled */
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  ],
  variants: {
    variant: {
      primary:
        "bg-primary text-primary-foreground data-[hovered]:bg-primary/90",
      destructive:
        "bg-destructive text-destructive-foreground data-[hovered]:bg-destructive/90",
      outline:
        "border border-input bg-background data-[hovered]:bg-accent data-[hovered]:text-accent-foreground",
      secondary:
        "bg-secondary text-secondary-foreground data-[hovered]:bg-secondary/80",
      ghost: "data-[hovered]:bg-accent data-[hovered]:text-accent-foreground",
      link: "text-primary underline-offset-4 data-[hovered]:underline",
    },
    size: {
      sm: "h-9 rounded-md px-3",
      md: "h-10 px-4 py-2",
      lg: "h-11 rounded-md px-8",
    },
    fullWidth: {
      true: "w-full",
    },
    isIconOnly: {
      true: "px-0",
    },
  },
  compoundVariants: [
    { isIconOnly: true, size: "sm", class: "size-9" },
    { isIconOnly: true, size: "md", class: "size-10" },
    { isIconOnly: true, size: "lg", class: "size-11" },
  ],
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export type ButtonStyleProps = VariantProps<typeof buttonStyles>;
