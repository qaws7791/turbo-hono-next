import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { ClassValue } from "clsx";

/**
 * Utility function to merge CSS class names
 * Combines clsx and tailwind-merge for proper Tailwind CSS class resolution
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: Array<ClassValue>): string {
  return twMerge(clsx(inputs));
}
