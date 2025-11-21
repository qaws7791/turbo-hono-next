"use client";

import { CalendarIcon } from "lucide-react";
import {
  DatePicker as AriaDatePicker,
  DateRangePicker as AriaDateRangePicker,
  Dialog as AriaDialog,
  Text,
  composeRenderProps,
} from "react-aria-components";

import { cn } from "../../../utils";
// TODO: Import from new location once button is migrated
import { Button } from "../../button";
import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarHeading,
  RangeCalendar,
} from "../calendar";
import { DateInput } from "../date-field";
import { FieldError, FieldGroup, Label } from "../../form";
import { Popover } from "../../overlay/popover";

import type {
  DatePickerContentProps,
  JollyDatePickerProps,
  JollyDateRangePickerProps,
} from "./date-picker.types";
import type { DateValue as AriaDateValue } from "react-aria-components";

/**
 * DatePicker component - Base date picker wrapper
 *
 * @example
 * ```tsx
 * <DatePicker value={date} onChange={setDate}>
 *   <Label>Date</Label>
 *   <FieldGroup>
 *     <DateInput />
 *     <Button>
 *       <CalendarIcon />
 *     </Button>
 *   </FieldGroup>
 *   <DatePickerContent>
 *     <Calendar>...</Calendar>
 *   </DatePickerContent>
 * </DatePicker>
 * ```
 */
const DatePicker = AriaDatePicker;

/**
 * DateRangePicker component - Base date range picker wrapper
 *
 * @example
 * ```tsx
 * <DateRangePicker value={range} onChange={setRange}>
 *   <Label>Date Range</Label>
 *   <FieldGroup>
 *     <DateInput slot="start" />
 *     <DateInput slot="end" />
 *     <Button>
 *       <CalendarIcon />
 *     </Button>
 *   </FieldGroup>
 *   <DatePickerContent>
 *     <RangeCalendar>...</RangeCalendar>
 *   </DatePickerContent>
 * </DateRangePicker>
 * ```
 */
const DateRangePicker = AriaDateRangePicker;

/**
 * DatePickerContent component - Popover content for date picker calendar
 *
 * @example
 * ```tsx
 * <DatePickerContent>
 *   <Calendar>
 *     <CalendarHeading />
 *     <CalendarGrid>
 *       <CalendarGridHeader>
 *         {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
 *       </CalendarGridHeader>
 *       <CalendarGridBody>
 *         {(date) => <CalendarCell date={date} />}
 *       </CalendarGridBody>
 *     </CalendarGrid>
 *   </Calendar>
 * </DatePickerContent>
 * ```
 */
const DatePickerContent = ({
  className,
  popoverClassName,
  ...props
}: DatePickerContentProps) => (
  <Popover
    className={composeRenderProps(popoverClassName, (className) =>
      cn("w-auto p-3", className),
    )}
  >
    <AriaDialog
      className={cn(
        "flex w-full flex-col space-y-4 outline-none sm:flex-row sm:space-x-4 sm:space-y-0",
        className,
      )}
      {...props}
    />
  </Popover>
);

/**
 * JollyDatePicker component - Complete date picker with label, description and error message
 *
 * @example
 * ```tsx
 * <JollyDatePicker
 *   label="Select Date"
 *   description="Choose a date from the calendar"
 *   errorMessage="Date is required"
 *   value={date}
 *   onChange={setDate}
 * />
 * ```
 */
function JollyDatePicker<T extends AriaDateValue>({
  label,
  description,
  errorMessage,
  className,
  ...props
}: JollyDatePickerProps<T>) {
  return (
    <DatePicker
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className),
      )}
      {...props}
    >
      <Label>{label}</Label>
      <FieldGroup>
        <DateInput
          className="flex-1"
          variant="ghost"
        />
        <Button
          variant="ghost"
          isIconOnly
          className="mr-1 size-6 data-[focus-visible]:ring-offset-0"
        >
          <CalendarIcon
            aria-hidden
            className="size-4"
          />
        </Button>
      </FieldGroup>
      {description && (
        <Text
          className="text-sm text-muted-foreground"
          slot="description"
        >
          {description}
        </Text>
      )}
      <FieldError>{errorMessage}</FieldError>
      <DatePickerContent>
        <Calendar>
          <CalendarHeading />
          <CalendarGrid>
            <CalendarGridHeader>
              {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => <CalendarCell date={date} />}
            </CalendarGridBody>
          </CalendarGrid>
        </Calendar>
      </DatePickerContent>
    </DatePicker>
  );
}

/**
 * JollyDateRangePicker component - Complete date range picker with label, description and error message
 *
 * @example
 * ```tsx
 * <JollyDateRangePicker
 *   label="Select Date Range"
 *   description="Choose start and end dates"
 *   errorMessage="Date range is required"
 *   value={dateRange}
 *   onChange={setDateRange}
 * />
 * ```
 */
function JollyDateRangePicker<T extends AriaDateValue>({
  label,
  description,
  errorMessage,
  className,
  ...props
}: JollyDateRangePickerProps<T>) {
  return (
    <DateRangePicker
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className),
      )}
      {...props}
    >
      <Label>{label}</Label>
      <FieldGroup>
        <DateInput
          variant="ghost"
          slot={"start"}
        />
        <span
          aria-hidden
          className="px-2 text-sm text-muted-foreground"
        >
          -
        </span>
        <DateInput
          className="flex-1"
          variant="ghost"
          slot={"end"}
        />

        <Button
          variant="ghost"
          isIconOnly
          className="mr-1 size-6 data-[focus-visible]:ring-offset-0"
        >
          <CalendarIcon
            aria-hidden
            className="size-4"
          />
        </Button>
      </FieldGroup>
      {description && (
        <Text
          className="text-sm text-muted-foreground"
          slot="description"
        >
          {description}
        </Text>
      )}
      <FieldError>{errorMessage}</FieldError>
      <DatePickerContent>
        <RangeCalendar>
          <CalendarHeading />
          <CalendarGrid>
            <CalendarGridHeader>
              {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => <CalendarCell date={date} />}
            </CalendarGridBody>
          </CalendarGrid>
        </RangeCalendar>
      </DatePickerContent>
    </DateRangePicker>
  );
}

export {
  DatePicker,
  DatePickerContent,
  DateRangePicker,
  JollyDatePicker,
  JollyDateRangePicker,
};
