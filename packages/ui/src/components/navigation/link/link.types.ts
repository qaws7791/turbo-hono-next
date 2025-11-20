import type { LinkProps as AriaLinkProps } from "react-aria-components";
import type { VariantProps } from "tailwind-variants";
import type { buttonStyles } from "../../button/button/button.styles";

/**
 * Props for the Link component.
 * Supports button-like styling variants.
 */
export interface LinkProps
  extends AriaLinkProps,
    VariantProps<typeof buttonStyles> {}
