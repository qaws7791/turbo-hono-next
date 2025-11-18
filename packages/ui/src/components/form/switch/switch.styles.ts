import { tv } from "tailwind-variants";

/**
 * Styles for the Switch container.
 * Groups the switch control with its label.
 */
export const switchContainerVariants = tv({
  base: [
    "group inline-flex items-center gap-2 text-sm font-medium leading-none",
    /* Disabled */
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
  ],
});

/**
 * Styles for the Switch control itself.
 * The visual toggle that changes state.
 */
export const switchVariants = tv({
  base: [
    "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors bg-input",
    /* Focus Visible */
    "group-data-[focus-visible]:outline-none group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-ring group-data-[focus-visible]:ring-offset-2 group-data-[focus-visible]:ring-offset-background",
    /* Disabled */
    "group-data-[disabled]:cursor-not-allowed group-data-[disabled]:opacity-50",
    /* Selected */
    "group-data-[selected]:bg-primary",
    /* Readonly */
    "group-data-[readonly]:cursor-default",
    /* Resets */
    "focus-visible:outline-none",
  ],
});

/**
 * Styles for the Switch handle (the sliding dot).
 * Animates position based on switch state.
 */
export const switchHandleVariants = tv({
  base: "pointer-events-none block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform translate-x-0 group-data-[selected]:translate-x-5",
});
