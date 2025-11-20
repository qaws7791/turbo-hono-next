import { tv } from "tailwind-variants";

/**
 * Sheet variants for slide-in dialog
 * Used for mobile-friendly bottom sheets and side panels
 */
export const sheetStyles = tv({
  base: [
    "fixed z-50 gap-4 bg-background shadow-lg transition ease-in-out",
    /* Entering */
    "data-[entering]:duration-500 data-[entering]:animate-in",
    /* Exiting */
    "data-[exiting]:duration-300 data-[exiting]:animate-out",
  ],
  variants: {
    side: {
      top: "inset-x-0 top-0 border-b data-[entering]:slide-in-from-top data-[exiting]:slide-out-to-top",
      bottom:
        "inset-x-0 bottom-0 border-t data-[entering]:slide-in-from-bottom data-[exiting]:slide-out-to-bottom",
      left: "inset-y-0 left-0 h-full w-3/4 border-r data-[entering]:slide-in-from-left data-[exiting]:slide-out-to-left sm:max-w-sm",
      right:
        "inset-y-0 right-0 h-full w-3/4 border-l data-[entering]:slide-in-from-right data-[exiting]:slide-out-to-right sm:max-w-sm",
    },
  },
});
