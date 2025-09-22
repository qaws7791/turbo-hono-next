"use client";

import {
  Link as AriaLink,
  LinkProps as AriaLinkProps,
  composeRenderProps,
} from "react-aria-components";
import { type VariantProps } from "tailwind-variants";

import { twMerge } from "tailwind-merge";

import { buttonStyles } from "./button";

interface LinkProps extends AriaLinkProps, VariantProps<typeof buttonStyles> {}

const Link = ({ className, variant, size, ...props }: LinkProps) => {
  return (
    <AriaLink
      className={composeRenderProps(className, (className) =>
        twMerge(
          variant &&
            buttonStyles({
              variant,
              size,
              className,
            }),
        ),
      )}
      {...props}
    />
  );
};

export { Link };
export type { LinkProps };
