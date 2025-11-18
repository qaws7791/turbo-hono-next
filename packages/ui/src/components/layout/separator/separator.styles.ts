import { tv } from "tailwind-variants";

/**
 * Separator style variants
 */
export const separatorVariants = tv({
  base: [
    "bg-border shrink-0",
    /* Horizontal */
    "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
    /* Vertical */
    "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
  ],
});
