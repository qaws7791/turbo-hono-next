"use client";

import * as React from "react";
import {
  Slider as AriaSlider,
  SliderOutput as AriaSliderOutput,
  SliderStateContext as AriaSliderStateContext,
  SliderThumb as AriaSliderThumb,
  SliderTrack as AriaSliderTrack,
  composeRenderProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";

import { focusVisibleRing } from "./utils";
import { labelStyles } from "./form";

import type {
  SliderOutputProps as AriaSliderOutputProps,
  SliderProps as AriaSliderProps,
  SliderThumbProps as AriaSliderThumbProps,
  SliderTrackProps as AriaSliderTrackProps,
} from "react-aria-components";

const SliderOutput = ({ className, ...props }: AriaSliderOutputProps) => (
  <AriaSliderOutput
    className={composeRenderProps(className, (className, renderProps) =>
      labelStyles({ ...renderProps, className }),
    )}
    {...props}
  />
);

const sliderStyles = tv({
  base: "relative flex touch-none select-none items-center flex-col gap-3",
  variants: {
    orientation: {
      horizontal: "h-full",
      vertical: "w-full",
    },
  },
});

const Slider = <T extends number | Array<number>>({
  className,
  orientation = "horizontal",
  ...props
}: AriaSliderProps<T>) => (
  <AriaSlider
    className={composeRenderProps(className, (className) =>
      sliderStyles({ ...props, orientation, className }),
    )}
    orientation={orientation}
    {...props}
  />
);

const sliderTrackStyles = tv({
  base: "relative grow rounded-full bg-secondary data-[disabled]:opacity-50",
  variants: {
    orientation: {
      horizontal: "h-2 w-full",
      vertical: "h-full w-2",
    },
  },
});

const SliderTrack = ({ className, ...props }: AriaSliderTrackProps) => (
  <AriaSliderTrack
    className={composeRenderProps(className, (className, renderProps) =>
      sliderTrackStyles({
        ...renderProps,
        orientation: renderProps.orientation,
        className,
      }),
    )}
    {...props}
  />
);

const sliderFillTrackStyles = tv({
  base: "absolute rounded-full bg-primary",
  variants: {
    orientation: {
      horizontal: "h-full",
      vertical: "w-full bottom-0",
    },
  },
});

const SliderFillTrack = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const state = React.useContext(AriaSliderStateContext)!;
  const orientation = state.orientation === "vertical" ? "height" : "width";
  return (
    <div
      style={{ [orientation]: state.getThumbPercent(0) * 100 + "%" }}
      className={sliderFillTrackStyles({
        className,
        orientation: state.orientation,
      })}
      {...props}
    />
  );
};

const sliderThumbStyles = tv({
  extend: focusVisibleRing,
  base: [
    "left-1/2 top-1/2 block size-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors",
    /* Disabled */
    "data-[disabled]:pointer-events-none",
  ],
});

const SliderThumb = ({ className, ...props }: AriaSliderThumbProps) => (
  <AriaSliderThumb
    className={composeRenderProps(className, (className, renderProps) =>
      sliderThumbStyles({ ...renderProps, className }),
    )}
    {...props}
  />
);

export { Slider, SliderFillTrack, SliderOutput, SliderThumb, SliderTrack };
