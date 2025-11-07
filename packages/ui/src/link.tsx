"use client";

import { Link as AriaLink, composeRenderProps } from "react-aria-components";
import { twMerge } from "tailwind-merge";

import { buttonStyles } from "./button";

import type { LinkProps as AriaLinkProps } from "react-aria-components";
import type { VariantProps } from "tailwind-variants";

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
