"use client";

import {
  ProgressBar as AriaProgressBar,
  composeRenderProps,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";

import { Label, labelStyles } from "./form";

import type { ProgressBarProps as AriaProgressBarProps } from "react-aria-components";

interface ProgressProps extends AriaProgressBarProps {
  barClassName?: string;
  fillClassName?: string;
}

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

interface FormProgressBarProps extends ProgressProps {
  label?: string;
  showValue?: boolean;
}

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
          {showValue && <span className={labelStyles()}>{valueText}</span>}
        </div>
      )}
    </Progress>
  );
}

export { FormProgressBar, Progress };
export type { FormProgressBarProps, ProgressProps };
