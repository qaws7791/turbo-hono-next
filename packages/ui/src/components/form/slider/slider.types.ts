import type {
  SliderOutputProps as AriaSliderOutputProps,
  SliderProps as AriaSliderProps,
  SliderThumbProps as AriaSliderThumbProps,
  SliderTrackProps as AriaSliderTrackProps,
} from "react-aria-components";
import type { HTMLAttributes } from "react";

/**
 * Props for the Slider component.
 * Supports single value or range (array of numbers) selection.
 *
 * @template T - The value type, either a single number or an array of numbers
 */
export type SliderProps<T extends number | Array<number>> = AriaSliderProps<T>;

/**
 * Props for the SliderOutput component.
 * Displays the current value of the slider.
 */
export type SliderOutputProps = AriaSliderOutputProps;

/**
 * Props for the SliderTrack component.
 * The track represents the full range of the slider.
 */
export type SliderTrackProps = AriaSliderTrackProps;

/**
 * Props for the SliderFillTrack component.
 * The filled portion of the track representing the current value.
 */
export type SliderFillTrackProps = HTMLAttributes<HTMLDivElement>;

/**
 * Props for the SliderThumb component.
 * The draggable handle for adjusting the slider value.
 */
export type SliderThumbProps = AriaSliderThumbProps;
