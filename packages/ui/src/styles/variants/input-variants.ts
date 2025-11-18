import { tv } from "tailwind-variants";

import { focusRing } from "../../utils/focus-ring";

/**
 * Input field container style variants
 * Used by TextField, NumberField, SearchField, etc.
 */
export const inputGroupVariants = tv({
  base: "",
  variants: {
    variant: {
      default: [
        "relative flex h-10 w-full items-center overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "data-[focus-within]:outline-none data-[focus-within]:ring-2 data-[focus-within]:ring-ring data-[focus-within]:ring-offset-2",
        "data-[disabled]:opacity-50",
      ],
      ghost: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/**
 * Input element style variants
 * Used for the actual input element inside containers
 */
export const inputVariants = tv({
  extend: focusRing,
  base: [
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
    /* File */
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
    /* Placeholder */
    "placeholder:text-muted-foreground",
    /* Disabled */
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  ],
});

/**
 * Text area style variants
 */
export const textAreaVariants = tv({
  extend: focusRing,
  base: [
    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
    /* Placeholder */
    "placeholder:text-muted-foreground",
    /* Disabled */
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  ],
});
