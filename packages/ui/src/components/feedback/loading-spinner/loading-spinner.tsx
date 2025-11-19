import { cn } from "../../../utils";

import type { LoadingSpinnerProps } from "./loading-spinner.types";

/**
 * LoadingSpinner - Simple animated spinner for loading states.
 * Displays a rotating circular indicator.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <LoadingSpinner />
 * ```
 *
 * @example
 * Custom styling:
 * ```tsx
 * <LoadingSpinner className="h-8 w-8 border-blue-500" />
 * ```
 *
 * @example
 * Centered in a container:
 * ```tsx
 * <div className="flex h-screen items-center justify-center">
 *   <LoadingSpinner />
 * </div>
 * ```
 *
 * @example
 * With custom color:
 * ```tsx
 * <LoadingSpinner className="border-b-primary" />
 * ```
 */
const LoadingSpinner = ({ className, ...props }: LoadingSpinnerProps) => (
  <div
    className={cn("flex justify-center items-center", className)}
    {...props}
  >
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
  </div>
);

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };
export default LoadingSpinner;
