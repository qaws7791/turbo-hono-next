import type { GroupProps as AriaGroupProps } from "react-aria-components";
import type { VariantProps } from "tailwind-variants";
import type { fieldGroupVariants } from "./field-group.styles";

/**
 * FieldGroup component variant props
 */
export type FieldGroupVariantProps = VariantProps<typeof fieldGroupVariants>;

/**
 * FieldGroup component props
 */
export interface FieldGroupProps
  extends AriaGroupProps,
    FieldGroupVariantProps {
  /**
   * Visual variant of the field group
   * @default 'default'
   *
   * - `default`: Standard bordered container
   * - `ghost`: No visible container
   */
  variant?: FieldGroupVariantProps["variant"];
}
