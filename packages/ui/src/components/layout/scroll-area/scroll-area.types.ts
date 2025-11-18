import type { ComponentProps } from "react";

/**
 * Props for the ScrollArea component.
 */
export interface ScrollAreaProps extends ComponentProps<"div"> {
  /** Orientation of scrolling */
  orientation?: "vertical" | "horizontal" | "both";
}
