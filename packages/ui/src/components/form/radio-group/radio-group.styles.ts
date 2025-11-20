import { tv } from "tailwind-variants";

import { labelStyles } from "../label/label.styles";

export const radioGroupStyles = tv({
  base: "group/radiogroup flex flex-col flex-wrap gap-2",
  variants: {
    orientation: {
      horizontal: "flex-row items-center",
      vertical: "flex-col flex-wrap gap-2",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

export const radioStyles = tv({
  extend: labelStyles,
  base: [
    "group/radio flex items-center gap-x-2",
    /* Disabled */
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
  ],
});

export const radioInnerStyles = tv({
  base: [
    /* Layout */
    "flex aspect-square size-4 items-center justify-center rounded-full border border-primary text-primary ring-offset-background",
    /* Focus */
    "group-data-[focused]/radio:outline-none",
    /* Focus Visible */
    "group-data-[focus-visible]/radio:ring-2 group-data-[focus-visible]/radio:ring-ring group-data-[focus-visible]/radio:ring-offset-2",
    /* Disabled */
    "group-data-[disabled]/radio:cursor-not-allowed group-data-[disabled]/radio:opacity-50",
    /* Invalid */
    "group-data-[invalid]/radio:border-destructive",
  ],
});
