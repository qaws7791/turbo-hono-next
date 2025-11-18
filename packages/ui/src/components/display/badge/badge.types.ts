import type * as React from "react";
import type { VariantProps } from "tailwind-variants";
import type { badgeStyles } from "./badge.styles";

export type BadgeStylesProps = VariantProps<typeof badgeStyles>;

export interface BadgeProps
  extends React.ComponentProps<"div">,
    BadgeStylesProps {}
