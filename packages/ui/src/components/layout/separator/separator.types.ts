import type { ComponentProps } from "react";
import type { SeparatorProps as SeparatorPropsReactAria } from "react-aria";

/**
 * Separator component props
 * Combines React Aria separator props with standard div props
 */
export type SeparatorProps = SeparatorPropsReactAria & ComponentProps<"div">;
