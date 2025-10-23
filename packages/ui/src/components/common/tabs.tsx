"use client";

import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
  SelectionIndicator,
  composeRenderProps,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";

import type {
  TabListProps as AriaTabListProps,
  TabPanelProps as AriaTabPanelProps,
  TabProps as AriaTabProps,
  TabsProps as AriaTabsProps,
} from "react-aria-components";

function Tabs({ className, ...props }: AriaTabsProps) {
  return (
    <AriaTabs
      className={composeRenderProps(className, (className) =>
        twMerge(
          "group flex",
          /* Orientation */
          "data-[orientation=horizontal]:flex-col",
          className,
        ),
      )}
      {...props}
    />
  );
}

const TabList = <T extends object>({
  className,
  ...props
}: AriaTabListProps<T>) => (
  <AriaTabList
    className={composeRenderProps(className, (className) =>
      twMerge(
        "flex",
        /* Orientation */
        "data-[orientation=horizontal]:border-b",
        "data-[orientation=horizontal]:border-border",
        "data-[orientation=horizontal]:[&_.selection-indicator]:bottom-0",
        "data-[orientation=horizontal]:[&_.selection-indicator]:left-0",
        "data-[orientation=horizontal]:[&_.selection-indicator]:w-full",
        "data-[orientation=horizontal]:[&_.selection-indicator]:border-b-[3px]",
        "data-[orientation=horizontal]:[&_.selection-indicator]:border-primary",
        "data-[orientation=vertical]:flex-col",
        className,
      ),
    )}
    {...props}
  />
);

const Tab = ({ className, ...props }: AriaTabProps) => (
  <AriaTab
    className={composeRenderProps(className, (className) =>
      twMerge(
        "relative inline-flex min-w-0 cursor-default items-center justify-center whitespace-nowrap py-2.5 px-4 text-sm font-medium text-muted-foreground outline-none forced-color-adjust:none",
        /* Hover */
        "hover:cursor-pointer",
        /* Disabled */
        "disabled:pointer-events-none disabled:opacity-50",
        /* Selected */
        "selected:text-foreground selected:border-primary",
        /* Orientation */
        "group-data-[orientation=vertical]:w-full",
        className,
      ),
    )}
    {...props}
  >
    {composeRenderProps(props.children, (children) => (
      <>
        {children}
        <SelectionIndicator className="selection-indicator pointer-events-none absolute transition-[translate,width,height] duration-200 motion-reduce:transition-none" />
      </>
    ))}
  </AriaTab>
);

const TabPanel = ({ className, ...props }: AriaTabPanelProps) => (
  <AriaTabPanel
    className={composeRenderProps(className, (className) =>
      twMerge("rounded outline-none", className),
    )}
    {...props}
  />
);

export { Tab, TabList, TabPanel, Tabs };
