import type {
  TabListProps as AriaTabListProps,
  TabPanelProps as AriaTabPanelProps,
  TabProps as AriaTabProps,
  TabsProps as AriaTabsProps,
} from "react-aria-components";

/**
 * Props for the Tabs component.
 */
export type TabsProps = AriaTabsProps;

/**
 * Props for the TabList component.
 */
export type TabListProps<T extends object> = AriaTabListProps<T>;

/**
 * Props for the Tab component.
 */
export type TabProps = AriaTabProps;

/**
 * Props for the TabPanel component.
 */
export type TabPanelProps = AriaTabPanelProps;
