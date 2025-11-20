import { tv } from "tailwind-variants";

import { focusVisibleRing } from "../../../utils";

/**
 * Sidebar component variant styles.
 */
export const sidebarStyles = tv({
  slots: {
    root: "w-full max-w-[256px] bg-background border-r border-border flex flex-col h-full",
    header: "px-4 py-5",
    headerContent: "flex items-center justify-between",
    logo: "flex items-center gap-3",
    logoIcon:
      "w-8 h-8 bg-primary rounded-full flex items-center justify-center",
    logoText: "text-foreground font-medium",
    closeButton:
      "p-1 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
    nav: "px-3 space-y-1",
    content: "flex-1 flex flex-col",
    footer: "p-3",
  },
});

/**
 * Navigation item variant styles.
 */
export const navItemStyles = tv({
  extend: focusVisibleRing,
  base: "w-full flex items-center justify-between px-3 py-2 rounded-md group font-medium transition-colors",
  variants: {
    isActive: {
      true: "bg-accent text-accent-foreground",
      false:
        "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    },
  },
  defaultVariants: {
    isActive: false,
  },
});

/**
 * User menu variant styles.
 */
export const userMenuStyles = tv({
  extend: focusVisibleRing,
  base: "w-full flex items-center justify-between p-2 hover:bg-accent rounded-md transition-colors",
});
