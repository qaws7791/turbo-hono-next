import { tv } from "tailwind-variants";

/**
 * Label style variants
 * Used for form labels with proper disabled and invalid states
 */
export const labelStyles = tv({
  base: [
    "text-sm font-medium leading-none group-data-[invalid]:text-destructive",
    /* Disabled */
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
  ],
});
