import { tv } from "tailwind-variants";

import { focusRing } from "../../../utils";

export const toastRegionStyles = tv({
  base: [
    "fixed top-4 right-4 z-50 w-full max-w-sm space-y-2",
    "flex flex-col gap-2",
  ],
});

export const toastStyles = tv({
  extend: focusRing,
  base: [
    "group relative flex items-center gap-3 overflow-hidden rounded-lg border p-4 shadow-lg",
    "transition-all duration-300 ease-in-out",
    /* Animation States */
    "data-[entering]:animate-in data-[entering]:slide-in-from-right-full",
    "data-[exiting]:animate-out data-[exiting]:slide-out-to-right-full",
  ],
  variants: {
    variant: {
      default: "border-border bg-background text-foreground",
      destructive: "border-destructive/20 bg-destructive/10 text-destructive",
      success: "border-green-200 bg-green-50 text-green-800",
      warning: "border-amber-200 bg-amber-50 text-amber-800",
      info: "border-blue-200 bg-blue-50 text-blue-800",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
