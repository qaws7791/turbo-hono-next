import type { SolarIconName } from "../../../types/solar-icons";

/**
 * Icon name type, prefixed with "solar--".
 */
export type IconName = `solar--${SolarIconName}`;

/**
 * Props for the Icon component.
 */
export interface IconProps {
  /** Icon name from Solar Icon set */
  name: IconName;
  /** Icon type/style */
  type: "iconify" | "iconify-color";
  /** Custom className for styling */
  className?: string;
}
