import { tv } from "tailwind-variants";

export const searchFieldInputStyles = tv({
  base: "min-w-0 flex-1 bg-background px-2 py-1.5 outline-0 placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden",
});

export const searchFieldGroupStyles = tv({
  base: [
    "flex h-10 w-full items-center overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
    /* Focus Within */
    "data-[focus-within]:outline-none data-[focus-within]:ring-2 data-[focus-within]:ring-ring data-[focus-within]:ring-offset-2",
    /* Disabled */
    "data-[disabled]:opacity-50",
  ],
});

export const searchFieldClearStyles = tv({
  base: [
    "mr-1 rounded-sm opacity-70 ring-offset-background transition-opacity",
    /* Hovered */
    "data-[hovered]:opacity-100",
    /* Disabled */
    "data-[disabled]:pointer-events-none",
    /* Empty */
    "group-data-[empty]:invisible",
  ],
});
