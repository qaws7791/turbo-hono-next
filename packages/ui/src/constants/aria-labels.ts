/**
 * Common ARIA labels used across components
 * Following WCAG 2.1 accessibility standards
 */

export const ARIA_LABELS = {
  /** For dialog close buttons */
  CLOSE: "Close",
  CLOSE_DIALOG: "Close dialog",

  /** For search inputs */
  SEARCH: "Search",
  CLEAR_SEARCH: "Clear search",

  /** For menu buttons and toggles */
  MENU: "Menu",
  TOGGLE_MENU: "Toggle menu",
  MORE_OPTIONS: "More options",

  /** For select components */
  OPEN_DROPDOWN: "Open dropdown",
  CLOSE_DROPDOWN: "Close dropdown",

  /** For navigation */
  NAVIGATION: "Navigation",
  MAIN_NAVIGATION: "Main navigation",

  /** For loading and progress */
  LOADING: "Loading",
  IN_PROGRESS: "In progress",

  /** For errors and validation */
  ERROR: "Error",
  ERROR_MESSAGE: "Error message",

  /** For interactive controls */
  EXPAND: "Expand",
  COLLAPSE: "Collapse",
  SHOW_MORE: "Show more",
  SHOW_LESS: "Show less",
} as const;

export type AriaLabel = (typeof ARIA_LABELS)[keyof typeof ARIA_LABELS];
