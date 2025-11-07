"use client";

import * as React from "react";
import { tv } from "tailwind-variants";

import { focusRing } from "./utils";

import type { VariantProps } from "tailwind-variants";

const badgeStyles = tv({
  extend: focusRing,
  base: [
    "inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-semibold ring-offset-background transition-colors h-fit",
    /* Focus */
    "data-[focused]:outline-none data-[focused]:ring-2 data-[focused]:ring-ring data-[focused]:ring-offset-2",
    /* Disabled */
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  ],
  variants: {
    variant: {
      primary: [
        "border-transparent bg-primary text-primary-foreground",
        /* Hover */
        "data-[hovered]:bg-primary/80",
      ],
      secondary: [
        "border-transparent bg-secondary text-secondary-foreground",
        /* Hover */
        "data-[hovered]:bg-secondary/80",
      ],
      destructive: [
        "border-transparent bg-destructive text-destructive-foreground",
        /* Hover */
        "data-[hovered]:bg-destructive/80",
      ],
      outline: "text-foreground border border-border",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

type BadgeStylesProps = VariantProps<typeof badgeStyles>;

interface BadgeProps extends React.ComponentProps<"div">, BadgeStylesProps {}

const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return (
    <div
      className={badgeStyles({
        variant,
        className,
      })}
      {...props}
    />
  );
};

export { Badge, badgeStyles };
export type { BadgeProps, BadgeStylesProps };
