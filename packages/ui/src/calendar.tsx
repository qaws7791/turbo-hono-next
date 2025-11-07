"use client";

import { getLocalTimeZone, today } from "@internationalized/date";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import {
  Button as AriaButton,
  Calendar as AriaCalendar,
  CalendarCell as AriaCalendarCell,
  CalendarGrid as AriaCalendarGrid,
  CalendarGridBody as AriaCalendarGridBody,
  CalendarGridHeader as AriaCalendarGridHeader,
  CalendarHeaderCell as AriaCalendarHeaderCell,
  Heading as AriaHeading,
  RangeCalendar as AriaRangeCalendar,
  RangeCalendarStateContext as AriaRangeCalendarStateContext,
  Text,
  composeRenderProps,
  useLocale,
} from "react-aria-components";

import { twMerge } from "./utils";
import { buttonStyles } from "./button";

import type {
  CalendarCellProps as AriaCalendarCellProps,
  CalendarGridBodyProps as AriaCalendarGridBodyProps,
  CalendarGridHeaderProps as AriaCalendarGridHeaderProps,
  CalendarGridProps as AriaCalendarGridProps,
  CalendarHeaderCellProps as AriaCalendarHeaderCellProps,
  CalendarProps as AriaCalendarProps,
  DateValue as AriaDateValue,
  RangeCalendarProps as AriaRangeCalendarProps,
} from "react-aria-components";

const Calendar = AriaCalendar;

const RangeCalendar = AriaRangeCalendar;

const CalendarHeading = (props: React.ComponentProps<"header">) => {
  const { direction } = useLocale();

  return (
    <header
      className="flex w-full items-center gap-1 px-1 pb-4"
      {...props}
    >
      <AriaButton
        slot="previous"
        className={twMerge(
          buttonStyles({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50",
          /* Hover */
          "data-[hovered]:opacity-100",
        )}
      >
        {direction === "rtl" ? (
          <ChevronRight
            aria-hidden
            className="size-4"
          />
        ) : (
          <ChevronLeft
            aria-hidden
            className="size-4"
          />
        )}
      </AriaButton>
      <AriaHeading className="grow text-center text-sm font-medium" />
      <AriaButton
        slot="next"
        className={twMerge(
          buttonStyles({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50",
          /* Hover */
          "data-[hovered]:opacity-100",
        )}
      >
        {direction === "rtl" ? (
          <ChevronLeft
            aria-hidden
            className="size-4"
          />
        ) : (
          <ChevronRight
            aria-hidden
            className="size-4"
          />
        )}
      </AriaButton>
    </header>
  );
};

const CalendarGrid = ({ className, ...props }: AriaCalendarGridProps) => (
  <AriaCalendarGrid
    className={twMerge(
      " border-separate border-spacing-x-0 border-spacing-y-1 ",
      className,
    )}
    {...props}
  />
);

const CalendarGridHeader = ({ ...props }: AriaCalendarGridHeaderProps) => (
  <AriaCalendarGridHeader {...props} />
);

const CalendarHeaderCell = ({
  className,
  ...props
}: AriaCalendarHeaderCellProps) => (
  <AriaCalendarHeaderCell
    className={twMerge(
      "w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground",
      className,
    )}
    {...props}
  />
);

const CalendarGridBody = ({
  className,
  ...props
}: AriaCalendarGridBodyProps) => (
  <AriaCalendarGridBody
    className={twMerge("[&>tr>td]:p-0", className)}
    {...props}
  />
);

const CalendarCell = ({ className, ...props }: AriaCalendarCellProps) => {
  const isRange = Boolean(React.useContext(AriaRangeCalendarStateContext));
  return (
    <AriaCalendarCell
      className={composeRenderProps(className, (className, renderProps) =>
        twMerge(
          buttonStyles({ variant: "ghost" }),
          "relative flex size-9 items-center justify-center p-0 text-sm font-normal",
          /* Disabled */
          renderProps.isDisabled && "text-muted-foreground opacity-50",
          /* Selected */
          renderProps.isSelected &&
            "bg-primary text-primary-foreground data-[focused]:bg-primary  data-[focused]:text-primary-foreground",
          /* Hover */
          renderProps.isHovered &&
            renderProps.isSelected &&
            (renderProps.isSelectionStart ||
              renderProps.isSelectionEnd ||
              !isRange) &&
            "data-[hovered]:bg-primary data-[hovered]:text-primary-foreground",
          /* Selection Start/End */
          renderProps.isSelected &&
            isRange &&
            !renderProps.isSelectionStart &&
            !renderProps.isSelectionEnd &&
            "rounded-none bg-accent text-accent-foreground",
          /* Outside Month */
          renderProps.isOutsideMonth &&
            "text-muted-foreground opacity-50 data-[selected]:bg-accent/50 data-[selected]:text-muted-foreground data-[selected]:opacity-30",
          /* Current Date */
          renderProps.date.compare(today(getLocalTimeZone())) === 0 &&
            !renderProps.isSelected &&
            "bg-accent text-accent-foreground",
          /* Unavailable Date */
          renderProps.isUnavailable && "cursor-default text-destructive ",
          renderProps.isInvalid &&
            "bg-destructive text-destructive-foreground data-[focused]:bg-destructive data-[hovered]:bg-destructive data-[focused]:text-destructive-foreground data-[hovered]:text-destructive-foreground",
          className,
        ),
      )}
      {...props}
    />
  );
};

interface FormCalendarProps<T extends AriaDateValue>
  extends AriaCalendarProps<T> {
  errorMessage?: string;
}

function FormCalendar<T extends AriaDateValue>({
  errorMessage,
  className,
  ...props
}: FormCalendarProps<T>) {
  return (
    <Calendar
      className={composeRenderProps(className, (className) =>
        twMerge("w-fit", className),
      )}
      {...props}
    >
      <CalendarHeading />
      <CalendarGrid>
        <CalendarGridHeader>
          {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
        </CalendarGridHeader>
        <CalendarGridBody>
          {(date) => <CalendarCell date={date} />}
        </CalendarGridBody>
      </CalendarGrid>
      {errorMessage && (
        <Text
          className="text-sm text-destructive"
          slot="errorMessage"
        >
          {errorMessage}
        </Text>
      )}
    </Calendar>
  );
}

interface FormRangeCalendarProps<T extends AriaDateValue>
  extends AriaRangeCalendarProps<T> {
  errorMessage?: string;
}

function FormRangeCalendar<T extends AriaDateValue>({
  errorMessage,
  className,
  ...props
}: FormRangeCalendarProps<T>) {
  return (
    <RangeCalendar
      className={composeRenderProps(className, (className) =>
        twMerge("w-fit", className),
      )}
      {...props}
    >
      <CalendarHeading />
      <CalendarGrid>
        <CalendarGridHeader>
          {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
        </CalendarGridHeader>
        <CalendarGridBody>
          {(date) => <CalendarCell date={date} />}
        </CalendarGridBody>
      </CalendarGrid>
      {errorMessage && (
        <Text
          slot="errorMessage"
          className="text-sm text-destructive"
        >
          {errorMessage}
        </Text>
      )}
    </RangeCalendar>
  );
}

export {
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarHeading,
  FormCalendar,
  FormRangeCalendar,
  RangeCalendar,
};
export type { FormCalendarProps, FormRangeCalendarProps };
