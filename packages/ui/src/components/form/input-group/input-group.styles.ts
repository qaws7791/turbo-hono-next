import { tv } from "tailwind-variants";

/**
 * Styles for InputGroupAddon.
 * Supports different alignments (inline-start, inline-end, block-start, block-end).
 */
export const inputGroupAddonStyles = tv({
  base: "text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium select-none [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[calc(var(--radius)-5px)] group-data-[disabled=true]/input-group:opacity-50",
  variants: {
    align: {
      "inline-start":
        "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
      "inline-end":
        "order-last pr-3 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]",
      "block-start":
        "order-first w-full justify-start px-3 pt-3 [.border-b]:pb-3 group-has-[>input]/input-group:pt-2.5",
      "block-end":
        "order-last w-full justify-start px-3 pb-3 [.border-t]:pt-3 group-has-[>input]/input-group:pb-2.5",
    },
  },
  defaultVariants: {
    align: "inline-start",
  },
});

/**
 * Styles for InputGroupButton.
 * Compact button styles for use within input groups.
 */
export const inputGroupButtonStyles = tv({
  base: "text-sm shadow-none flex gap-2 items-center",
  variants: {
    size: {
      xs: "h-6 gap-1 px-2 rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-3.5 has-[>svg]:px-2",
      sm: "h-8 px-2.5 gap-1.5 rounded-md has-[>svg]:px-2.5",
      "icon-xs": "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
      "icon-sm": "size-8 p-0 has-[>svg]:p-0",
    },
  },
  defaultVariants: {
    size: "xs",
  },
});

export const inputGroupStyles = tv({
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
