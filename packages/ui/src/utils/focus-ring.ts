import { tv } from "tailwind-variants";

/**
 * Focus ring styling for form components
 * Used for components that handle focused state
 */
export const focusRing = tv({
  base: "data-[focused]:outline-none data-[focused]:ring-2 data-[focused]:ring-ring data-[focused]:ring-offset-2 data-[focus-visible]:outline-none",
});

/**
 * Focus visible ring styling for interactive components
 * Used for components that handle focus-visible state (keyboard focus)
 */
export const focusVisibleRing = tv({
  base: "data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2",
});
