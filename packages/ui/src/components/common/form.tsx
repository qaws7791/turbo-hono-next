"use client";

import {
  FieldError as AriaFieldError,
  Group as AriaGroup,
  Label as AriaLabel,
  Text as AriaText,
  Form,
  composeRenderProps,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

import type {
  FieldErrorProps as AriaFieldErrorProps,
  GroupProps as AriaGroupProps,
  LabelProps as AriaLabelProps,
  TextProps as AriaTextProps,
} from "react-aria-components";
import type { VariantProps } from "tailwind-variants";

const labelStyles = tv({
  base: [
    "text-sm font-medium leading-none group-data-[invalid]:text-destructive",
    /* Disabled */
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
  ],
});

const Label = ({ className, ...props }: AriaLabelProps) => (
  <AriaLabel
    className={labelStyles({ className })}
    {...props}
  />
);

const descriptionStyles = tv({
  base: "text-sm text-muted-foreground",
});

function FormDescription({ className, ...props }: AriaTextProps) {
  return (
    <AriaText
      className={descriptionStyles({ className })}
      {...props}
      slot="description"
    />
  );
}

function FieldError({ className, ...props }: AriaFieldErrorProps) {
  return (
    <AriaFieldError
      className={composeRenderProps(className, (className) =>
        twMerge(className, "text-sm font-medium text-destructive"),
      )}
      {...props}
    />
  );
}

const fieldGroupStyles = tv({
  base: "",
  variants: {
    variant: {
      default: [
        "relative flex h-10 w-full items-center overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        /* Focus Within */
        "data-[focus-within]:outline-none data-[focus-within]:ring-2 data-[focus-within]:ring-ring data-[focus-within]:ring-offset-2",
        /* Disabled */
        "data-[disabled]:opacity-50",
      ],
      ghost: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface GroupProps
  extends AriaGroupProps,
    VariantProps<typeof fieldGroupStyles> {}

function FieldGroup({ className, variant, ...props }: GroupProps) {
  return (
    <AriaGroup
      className={composeRenderProps(className, (className, renderProps) =>
        fieldGroupStyles({ ...renderProps, variant, className }),
      )}
      {...props}
    />
  );
}

export {
  FieldError,
  FieldGroup,
  fieldGroupStyles,
  Form,
  FormDescription,
  Label,
  labelStyles,
};
