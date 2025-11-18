"use client";

import {
  Button as AriaButton,
  composeRenderProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";

import { focusVisibleRing } from "./utils";

import type { ButtonProps as AriaButtonProps } from "react-aria-components";
import type { VariantProps } from "tailwind-variants";

const buttonStyles = tv({
  extend: focusVisibleRing,
  base: [
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors",
    /* Disabled */
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  ],
  variants: {
    variant: {
      primary:
        "bg-primary text-primary-foreground data-[hovered]:bg-primary/90",
      destructive:
        "bg-destructive text-destructive-foreground data-[hovered]:bg-destructive/90",
      outline:
        "border border-input bg-background data-[hovered]:bg-accent data-[hovered]:text-accent-foreground",
      secondary:
        "bg-secondary text-secondary-foreground data-[hovered]:bg-secondary/80",
      ghost: "data-[hovered]:bg-accent data-[hovered]:text-accent-foreground",
      link: "text-primary underline-offset-4 data-[hovered]:underline",
    },
    size: {
      md: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "size-10",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

type ButtonVariantProps = VariantProps<typeof buttonStyles>;

interface ButtonProps extends AriaButtonProps, ButtonVariantProps {}

const Button = ({ className, variant, size, ...props }: ButtonProps) => {
  return (
    <AriaButton
      className={composeRenderProps(className, (className, renderProps) =>
        buttonStyles({
          ...renderProps,
          variant,
          size,
          className,
        }),
      )}
      {...props}
    />
  );
};

export { Button, buttonStyles };
export type { ButtonProps, ButtonVariantProps };
