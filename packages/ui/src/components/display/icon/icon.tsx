import { twMerge } from "../../../utils";

import type { IconProps } from "./icon.types";

/**
 * Icon - Displays icons from the Solar icon set via Iconify.
 * Uses span-based rendering for optimal performance.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <Icon
 *   name="solar--home-linear"
 *   type="iconify"
 * />
 * ```
 *
 * @example
 * Colored icon:
 * ```tsx
 * <Icon
 *   name="solar--star-bold"
 *   type="iconify-color"
 *   className="text-yellow-500"
 * />
 * ```
 *
 * @example
 * Custom size:
 * ```tsx
 * <Icon
 *   name="solar--user-circle-linear"
 *   type="iconify"
 *   className="size-8"
 * />
 * ```
 */
export function Icon({ name, type, className }: IconProps) {
  return (
    <span className={twMerge(type, name, "size-6 inline-block", className)} />
  );
}

Icon.displayName = "Icon";
