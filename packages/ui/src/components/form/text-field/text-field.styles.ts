import { tv } from "tailwind-variants";

import { focusRing } from "../../../utils";

/**
 * Input element style variants
 * Used for the actual input element inside containers
 */
export const inputStyles = tv({
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
export const textAreaStyles = tv({
  extend: focusRing,
  base: [
    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
    /* Placeholder */
    "placeholder:text-muted-foreground",
    /* Disabled */
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  ],
});
