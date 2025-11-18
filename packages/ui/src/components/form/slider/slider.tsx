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

import { labelVariants } from "../label/label.styles";

import {
  sliderFillTrackVariants,
  sliderThumbVariants,
  sliderTrackVariants,
  sliderVariants,
} from "./slider.styles";

import type {
  SliderFillTrackProps,
  SliderOutputProps,
  SliderProps,
  SliderThumbProps,
  SliderTrackProps,
} from "./slider.types";

/**
 * SliderOutput component displays the current slider value.
 *
 * @example
 * ```tsx
 * <Slider defaultValue={50}>
 *   <SliderOutput />
 *   <SliderTrack>
 *     <SliderFillTrack />
 *     <SliderThumb />
 *   </SliderTrack>
 * </Slider>
 * ```
 */
const SliderOutput = ({ className, ...props }: SliderOutputProps) => (
  <AriaSliderOutput
    className={composeRenderProps(className, (className, renderProps) =>
      labelVariants({ ...renderProps, className }),
    )}
    {...props}
  />
);

SliderOutput.displayName = "SliderOutput";

/**
 * Slider component for selecting numeric values or ranges.
 * Supports both single value and range (array) selection.
 *
 * @example
 * Single value:
 * ```tsx
 * <Slider
 *   defaultValue={50}
 *   minValue={0}
 *   maxValue={100}
 * >
 *   <SliderTrack>
 *     <SliderFillTrack />
 *     <SliderThumb />
 *   </SliderTrack>
 * </Slider>
 * ```
 *
 * @example
 * Range selection:
 * ```tsx
 * <Slider
 *   defaultValue={[20, 80]}
 *   minValue={0}
 *   maxValue={100}
 * >
 *   <SliderTrack>
 *     <SliderFillTrack />
 *     <SliderThumb index={0} />
 *     <SliderThumb index={1} />
 *   </SliderTrack>
 * </Slider>
 * ```
 *
 * @example
 * Vertical orientation:
 * ```tsx
 * <Slider
 *   defaultValue={50}
 *   orientation="vertical"
 * >
 *   <SliderTrack>
 *     <SliderFillTrack />
 *     <SliderThumb />
 *   </SliderTrack>
 * </Slider>
 * ```
 */
const Slider = <T extends number | Array<number>>({
  className,
  orientation = "horizontal",
  ...props
}: SliderProps<T>) => (
  <AriaSlider
    className={composeRenderProps(className, (className) =>
      sliderVariants({ ...props, orientation, className }),
    )}
    orientation={orientation}
    {...props}
  />
);

Slider.displayName = "Slider";

/**
 * SliderTrack represents the full range of the slider.
 * Contains the fill track and thumb(s).
 *
 * @example
 * ```tsx
 * <SliderTrack>
 *   <SliderFillTrack />
 *   <SliderThumb />
 * </SliderTrack>
 * ```
 */
const SliderTrack = ({ className, ...props }: SliderTrackProps) => (
  <AriaSliderTrack
    className={composeRenderProps(className, (className, renderProps) =>
      sliderTrackVariants({
        ...renderProps,
        orientation: renderProps.orientation,
        className,
      }),
    )}
    {...props}
  />
);

SliderTrack.displayName = "SliderTrack";

/**
 * SliderFillTrack shows the filled portion of the slider.
 * Automatically calculates width/height based on current value.
 *
 * @example
 * ```tsx
 * <SliderTrack>
 *   <SliderFillTrack />
 *   <SliderThumb />
 * </SliderTrack>
 * ```
 */
const SliderFillTrack = ({
  className,
  ...props
}: SliderFillTrackProps): React.JSX.Element => {
  const state = React.useContext(AriaSliderStateContext)!;
  const orientation = state.orientation === "vertical" ? "height" : "width";
  return (
    <div
      style={{ [orientation]: state.getThumbPercent(0) * 100 + "%" }}
      className={sliderFillTrackVariants({
        className,
        orientation: state.orientation,
      })}
      {...props}
    />
  );
};

SliderFillTrack.displayName = "SliderFillTrack";

/**
 * SliderThumb is the draggable handle for adjusting values.
 * For range sliders, use multiple thumbs with different indices.
 *
 * @example
 * Single thumb:
 * ```tsx
 * <SliderThumb />
 * ```
 *
 * @example
 * Multiple thumbs (range):
 * ```tsx
 * <SliderThumb index={0} />
 * <SliderThumb index={1} />
 * ```
 */
const SliderThumb = ({ className, ...props }: SliderThumbProps) => (
  <AriaSliderThumb
    className={composeRenderProps(className, (className, renderProps) =>
      sliderThumbVariants({ ...renderProps, className }),
    )}
    {...props}
  />
);

SliderThumb.displayName = "SliderThumb";

export { Slider, SliderFillTrack, SliderOutput, SliderThumb, SliderTrack };
