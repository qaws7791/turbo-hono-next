"use client";

import {
  Switch as AriaSwitch,
  composeRenderProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";

import type { SwitchProps as AriaSwitchProps } from "react-aria-components";

const switchContainerStyles = tv({
  base: [
    "group inline-flex items-center gap-2 text-sm font-medium leading-none",
    /* Disabled */
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
  ],
});

const switchStyles = tv({
  base: [
    "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors bg-input",
    /* Focus Visible */
    "group-data-[focus-visible]:outline-none group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-ring group-data-[focus-visible]:ring-offset-2 group-data-[focus-visible]:ring-offset-background",
    /* Disabled */
    "group-data-[disabled]:cursor-not-allowed group-data-[disabled]:opacity-50",
    /* Selected */
    "group-data-[selected]:bg-primary",
    /* Readonly */
    "group-data-[readonly]:cursor-default",
    /* Resets */
    "focus-visible:outline-none",
  ],
});

const switchHandleStyles = tv({
  base: "pointer-events-none block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform translate-x-0 group-data-[selected]:translate-x-5",
});

const Switch = ({ children, className, ...props }: AriaSwitchProps) => (
  <AriaSwitch
    className={composeRenderProps(className, (className, renderProps) =>
      switchContainerStyles({ ...renderProps, className }),
    )}
    {...props}
  >
    {composeRenderProps(children, (children) => (
      <>
        <div className={switchStyles()}>
          <div className={switchHandleStyles()} />
        </div>
        {children}
      </>
    ))}
  </AriaSwitch>
);

export { Switch };
