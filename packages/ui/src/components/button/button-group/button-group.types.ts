import type { VariantProps } from "tailwind-variants";
import type { buttonGroupStyles } from "./button-group.styles";

/**
 * ButtonGroup component variant props
 */
export type ButtonGroupVariantProps = VariantProps<typeof buttonGroupStyles>;

/**
 * ButtonGroup component props
 */
export interface ButtonGroupProps
  extends React.ComponentProps<"div">,
    ButtonGroupVariantProps {}

/**
 * ButtonGroupText component props
 */
export interface ButtonGroupTextProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}
