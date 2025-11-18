"use client";

import {
  Disclosure as AriaDisclosure,
  DisclosurePanel as AriaDisclosurePanel,
  Button,
  composeRenderProps,
} from "react-aria-components";

import { twMerge } from "../../../utils";

import type {
  DisclosurePanelProps,
  DisclosureProps,
  DisclosureTriggerProps,
} from "./disclosure.types";

/**
 * Disclosure - Expandable/collapsible content container.
 * Provides an accessible way to show/hide content.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <Disclosure>
 *   <DisclosureTrigger>
 *     Show more information
 *     <ChevronDownIcon />
 *   </DisclosureTrigger>
 *   <DisclosurePanel>
 *     <p>Hidden content that can be revealed.</p>
 *   </DisclosurePanel>
 * </Disclosure>
 * ```
 *
 * @example
 * Controlled state:
 * ```tsx
 * const [isExpanded, setIsExpanded] = useState(false);
 *
 * <Disclosure isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
 *   <DisclosureTrigger>
 *     {isExpanded ? 'Show less' : 'Show more'}
 *   </DisclosureTrigger>
 *   <DisclosurePanel>
 *     Collapsible content
 *   </DisclosurePanel>
 * </Disclosure>
 * ```
 */
const Disclosure = ({ className, ...props }: DisclosureProps) => (
  <AriaDisclosure
    className={composeRenderProps(className, (className) =>
      twMerge("group", className),
    )}
    {...props}
  />
);

Disclosure.displayName = "Disclosure";

/**
 * DisclosureTrigger - Button that toggles the disclosure panel.
 * Automatically manages ARIA attributes for accessibility.
 *
 * @example
 * ```tsx
 * <DisclosureTrigger>
 *   Click to expand
 *   <ChevronDownIcon className="group-data-[expanded]:rotate-180" />
 * </DisclosureTrigger>
 * ```
 *
 * @example
 * Custom styling:
 * ```tsx
 * <DisclosureTrigger className="w-full justify-start">
 *   Expand section
 * </DisclosureTrigger>
 * ```
 */
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

DisclosureTrigger.displayName = "DisclosureTrigger";

/**
 * DisclosurePanel - The collapsible content area.
 * Animates in and out with smooth transitions.
 *
 * @example
 * ```tsx
 * <DisclosurePanel>
 *   <div className="p-4">
 *     <p>Content that can be hidden or shown</p>
 *   </div>
 * </DisclosurePanel>
 * ```
 *
 * @example
 * Custom padding:
 * ```tsx
 * <DisclosurePanel className="px-6 py-4">
 *   Expanded content with custom padding
 * </DisclosurePanel>
 * ```
 */
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

DisclosurePanel.displayName = "DisclosurePanel";

export { Disclosure, DisclosurePanel, DisclosureTrigger };
