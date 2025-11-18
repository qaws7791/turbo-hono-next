"use client";

import {
  ProgressBar as AriaProgressBar,
  composeRenderProps,
} from "react-aria-components";

// TODO: Update import once form components are migrated
import { Label, labelVariants } from "../../form/label";
import { twMerge } from "../../../utils";

import type { FormProgressBarProps, ProgressProps } from "./progress-bar.types";

/**
 * Progress - Base progress bar component.
 * Shows visual feedback for task completion or loading states.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <Progress value={50} />
 * ```
 *
 * @example
 * With custom children:
 * ```tsx
 * <Progress value={75}>
 *   {({ percentage }) => (
 *     <div>
 *       <span>Loading...</span>
 *       <span>{percentage}%</span>
 *     </div>
 *   )}
 * </Progress>
 * ```
 *
 * @example
 * Indeterminate progress:
 * ```tsx
 * <Progress isIndeterminate />
 * ```
 *
 * @example
 * Custom styling:
 * ```tsx
 * <Progress
 *   value={60}
 *   barClassName="h-2 bg-gray-200"
 *   fillClassName="bg-blue-500"
 * />
 * ```
 */
const Progress = ({
  className,
  barClassName,
  fillClassName,
  children,
  ...props
}: ProgressProps) => (
  <AriaProgressBar
    className={composeRenderProps(className, (className) =>
      twMerge("w-full", className),
    )}
    {...props}
  >
    {composeRenderProps(children, (children, renderProps) => (
      <>
        {children}
        <div
          className={twMerge(
            "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
            barClassName,
          )}
        >
          <div
            className={twMerge(
              "size-full flex-1 bg-primary transition-all",
              fillClassName,
            )}
            style={{
              transform: `translateX(-${100 - (renderProps.percentage || 0)}%)`,
            }}
          />
        </div>
      </>
    ))}
  </AriaProgressBar>
);

Progress.displayName = "Progress";

/**
 * FormProgressBar - Progress bar with label and optional value display.
 * Convenient for form contexts where a label is needed.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <FormProgressBar
 *   label="Upload Progress"
 *   value={45}
 * />
 * ```
 *
 * @example
 * Without value display:
 * ```tsx
 * <FormProgressBar
 *   label="Loading"
 *   value={70}
 *   showValue={false}
 * />
 * ```
 *
 * @example
 * With custom styling:
 * ```tsx
 * <FormProgressBar
 *   label="Download"
 *   value={80}
 *   barClassName="h-2"
 *   fillClassName="bg-green-500"
 * />
 * ```
 */
function FormProgressBar({
  label,
  className,
  showValue = true,
  ...props
}: FormProgressBarProps) {
  return (
    <Progress
      className={composeRenderProps(className, (className) =>
        twMerge("group flex flex-col gap-2", className),
      )}
      {...props}
    >
      {({ valueText }) => (
        <div className="flex w-full justify-between">
          <Label>{label}</Label>
          {showValue && <span className={labelVariants()}>{valueText}</span>}
        </div>
      )}
    </Progress>
  );
}

FormProgressBar.displayName = "FormProgressBar";

export { FormProgressBar, Progress };
