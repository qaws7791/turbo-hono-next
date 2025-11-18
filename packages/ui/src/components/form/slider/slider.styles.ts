import { tv } from "tailwind-variants";

import { focusVisibleRing } from "../../../utils";

/**
 * Styles for the Slider container.
 * Adapts layout based on orientation (horizontal/vertical).
 */
export const sliderVariants = tv({
  base: "relative flex touch-none select-none items-center flex-col gap-3",
  variants: {
    orientation: {
      horizontal: "h-full",
      vertical: "w-full",
    },
  },
});

/**
 * Styles for the SliderTrack.
 * The background track that shows the full range.
 */
export const sliderTrackVariants = tv({
  base: "relative grow rounded-full bg-secondary data-[disabled]:opacity-50",
  variants: {
    orientation: {
      horizontal: "h-2 w-full",
      vertical: "h-full w-2",
    },
  },
});

/**
 * Styles for the SliderFillTrack.
 * The colored portion showing the current value.
 */
export const sliderFillTrackVariants = tv({
  base: "absolute rounded-full bg-primary",
  variants: {
    orientation: {
      horizontal: "h-full",
      vertical: "w-full bottom-0",
    },
  },
});

/**
 * Styles for the SliderThumb.
 * The draggable handle with focus ring.
 */
export const sliderThumbVariants = tv({
  extend: focusVisibleRing,
  base: [
    "left-1/2 top-1/2 block size-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors",
    /* Disabled */
    "data-[disabled]:pointer-events-none",
  ],
});
