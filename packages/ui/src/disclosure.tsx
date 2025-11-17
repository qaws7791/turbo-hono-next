/* eslint-disable @typescript-eslint/no-empty-object-type */
"use client";

import {
  Disclosure as AriaDisclosure,
  DisclosurePanel as AriaDisclosurePanel,
  Button,
  composeRenderProps,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";

import type {
  DisclosurePanelProps as AriaDisclosurePanelProps,
  DisclosureProps as AriaDisclosureProps,
  ButtonProps,
} from "react-aria-components";

interface DisclosureProps extends AriaDisclosureProps {}

interface DisclosurePanelProps extends AriaDisclosurePanelProps {}

interface DisclosureTriggerProps extends ButtonProps {}

const Disclosure = ({ className, ...props }: DisclosureProps) => (
  <AriaDisclosure
    className={composeRenderProps(className, (className) =>
      twMerge("group", className),
    )}
    {...props}
  />
);

const DisclosureTrigger = ({ className, ...props }: DisclosureTriggerProps) => (
  <Button
    slot="trigger"
    className={composeRenderProps(className, (className) =>
      twMerge(
        "flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium transition-all",
        "data-[hovered]:bg-accent data-[hovered]:text-accent-foreground",
        "data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      ),
    )}
    {...props}
  />
);

const DisclosurePanel = ({ className, ...props }: DisclosurePanelProps) => (
  <AriaDisclosurePanel
    className={composeRenderProps(className, (className) =>
      twMerge(
        "overflow-hidden transition-all",
        /* Entering */
        "data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:slide-in-from-top-1",
        /* Exiting */
        "data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:slide-out-to-top-1",
        className,
      ),
    )}
    {...props}
  />
);

export { Disclosure, DisclosurePanel, DisclosureTrigger };
export type { DisclosurePanelProps, DisclosureProps, DisclosureTriggerProps };
