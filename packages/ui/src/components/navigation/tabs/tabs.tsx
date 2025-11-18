"use client";

import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
  SelectionIndicator,
  composeRenderProps,
} from "react-aria-components";

import { twMerge } from "../../../utils";

import type {
  TabListProps,
  TabPanelProps,
  TabProps,
  TabsProps,
} from "./tabs.types";

/**
 * Tabs - Container for tab navigation.
 * Supports horizontal and vertical orientations.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <Tabs>
 *   <TabList>
 *     <Tab id="home">Home</Tab>
 *     <Tab id="profile">Profile</Tab>
 *   </TabList>
 *   <TabPanel id="home">Home content</TabPanel>
 *   <TabPanel id="profile">Profile content</TabPanel>
 * </Tabs>
 * ```
 *
 * @example
 * Vertical orientation:
 * ```tsx
 * <Tabs orientation="vertical">
 *   <TabList>
 *     <Tab id="home">Home</Tab>
 *     <Tab id="profile">Profile</Tab>
 *   </TabList>
 *   <TabPanel id="home">Home content</TabPanel>
 *   <TabPanel id="profile">Profile content</TabPanel>
 * </Tabs>
 * ```
 */
function Tabs({ className, ...props }: TabsProps) {
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

Tabs.displayName = "Tabs";

/**
 * TabList - Container for Tab components.
 * Displays a visual border and selection indicator.
 *
 * @example
 * ```tsx
 * <TabList>
 *   <Tab id="tab1">Tab 1</Tab>
 *   <Tab id="tab2">Tab 2</Tab>
 *   <Tab id="tab3">Tab 3</Tab>
 * </TabList>
 * ```
 */
const TabList = <T extends object>({
  className,
  ...props
}: TabListProps<T>) => (
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

TabList.displayName = "TabList";

/**
 * Tab - Individual tab button.
 * Shows a selection indicator when active.
 *
 * @example
 * ```tsx
 * <Tab id="home">
 *   <HomeIcon />
 *   Home
 * </Tab>
 * ```
 *
 * @example
 * Disabled tab:
 * ```tsx
 * <Tab id="settings" isDisabled>
 *   Settings
 * </Tab>
 * ```
 */
const Tab = ({ className, ...props }: TabProps) => (
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

Tab.displayName = "Tab";

/**
 * TabPanel - Content container for each tab.
 * Displays when its corresponding tab is selected.
 *
 * @example
 * ```tsx
 * <TabPanel id="home">
 *   <h2>Welcome Home</h2>
 *   <p>Home page content...</p>
 * </TabPanel>
 * ```
 */
const TabPanel = ({ className, ...props }: TabPanelProps) => (
  <AriaTabPanel
    className={composeRenderProps(className, (className) =>
      twMerge("rounded outline-none", className),
    )}
    {...props}
  />
);

TabPanel.displayName = "TabPanel";

export { Tab, TabList, TabPanel, Tabs };
