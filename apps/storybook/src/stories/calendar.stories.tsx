import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { FormCalendar, FormRangeCalendar } from "@repo/ui/calendar";
import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";
import type { DateValue } from "react-aria-components";

/**
 * Calendar components based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation (Arrow keys to navigate, Enter to select)
 * - ARIA attributes for accessibility
 * - Single date and date range selection
 * - Min/max date constraints
 * - Unavailable dates
 * - Month/year navigation
 * - Localized formatting
 * - Accessible by default
 *
 * Components:
 * - FormCalendar: Single date selection
 * - FormRangeCalendar: Date range selection
 *
 * Common use cases:
 * - Date pickers
 * - Booking systems
 * - Event calendars
 * - Date range filters
 * - Availability calendars
 *
 * @see https://react-spectrum.adobe.com/react-aria/Calendar.html
 */
const meta = {
  title: "Components/Calendar",
  component: FormCalendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FormCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default single date calendar
 */
export const Default: Story = {
  render: () => <FormCalendar />,
};

/**
 * With default value
 */
export const WithDefaultValue: Story = {
  render: () => <FormCalendar defaultValue={parseDate("2024-06-15")} />,
};

/**
 * With min and max dates
 */
export const WithMinMax: Story = {
  render: () => (
    <FormCalendar
      minValue={today(getLocalTimeZone())}
      maxValue={today(getLocalTimeZone()).add({ months: 3 })}
    />
  ),
};

/**
 * Disabled calendar
 */
export const Disabled: Story = {
  render: () => (
    <FormCalendar
      defaultValue={parseDate("2024-06-15")}
      isDisabled
    />
  ),
};

/**
 * Read-only calendar
 */
export const ReadOnly: Story = {
  render: () => (
    <FormCalendar
      defaultValue={parseDate("2024-06-15")}
      isReadOnly
    />
  ),
};

/**
 * Controlled calendar
 */
export const Controlled: Story = {
  render: () => {
    const [date, setDate] = React.useState(parseDate("2024-06-15"));

    return (
      <div className="space-y-4">
        <FormCalendar
          value={date}
          onChange={setDate}
        />
        <div className="rounded-md bg-muted p-4">
          <p className="text-sm font-medium">
            Selected: {date?.toString() || "None"}
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Date range calendar
 */
export const RangeCalendar: Story = {
  render: () => <FormRangeCalendar />,
};

/**
 * Range calendar with default value
 */
export const RangeWithDefaultValue: Story = {
  render: () => (
    <FormRangeCalendar
      defaultValue={{
        start: parseDate("2024-06-10"),
        end: parseDate("2024-06-20"),
      }}
    />
  ),
};

/**
 * Controlled range calendar
 */
export const ControlledRange: Story = {
  render: () => {
    const [range, setRange] = React.useState({
      start: parseDate("2024-06-10"),
      end: parseDate("2024-06-15"),
    });

    return (
      <div className="space-y-4">
        <FormRangeCalendar
          value={range}
          onChange={setRange}
        />
        <div className="rounded-md bg-muted p-4">
          <p className="text-sm font-medium">
            Start: {range?.start?.toString() || "None"}
          </p>
          <p className="text-sm font-medium">
            End: {range?.end?.toString() || "None"}
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Booking availability calendar
 */
export const BookingCalendar: Story = {
  render: () => {
    const [date, setDate] = React.useState<DateValue | null>(null);

    const isDateUnavailable = (date: DateValue) => {
      // Example: Make weekends unavailable
      const dayOfWeek = date.toDate(getLocalTimeZone()).getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    };

    return (
      <div className="space-y-4">
        <div className="rounded-lg border p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Select Appointment Date
          </h3>
          <FormCalendar
            value={date}
            onChange={setDate}
            minValue={today(getLocalTimeZone())}
            maxValue={today(getLocalTimeZone()).add({ months: 2 })}
            isDateUnavailable={isDateUnavailable}
          />
          <p className="mt-4 text-sm text-muted-foreground">
            * Weekends are unavailable
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Event date range selector
 */
export const EventRangeSelector: Story = {
  render: () => {
    const [range, setRange] = React.useState<{
      start: DateValue;
      end: DateValue;
    } | null>(null);

    return (
      <div className="w-[400px] space-y-4 rounded-lg border p-6">
        <h3 className="text-lg font-semibold">Select Event Duration</h3>
        <FormRangeCalendar
          value={range}
          onChange={setRange}
          minValue={today(getLocalTimeZone())}
        />
        {range && (
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm font-medium">
              Duration: {range.end.compare(range.start)} days
            </p>
          </div>
        )}
      </div>
    );
  },
};

/**
 * Vacation planner
 */
export const VacationPlanner: Story = {
  render: () => {
    const [range, setRange] = React.useState<{
      start: DateValue;
      end: DateValue;
    } | null>(null);

    const calculateDays = () => {
      if (!range) return 0;
      return range.end.compare(range.start) + 1;
    };

    return (
      <div className="w-[400px] space-y-4 rounded-lg border p-6">
        <h3 className="text-lg font-semibold">Plan Your Vacation</h3>
        <FormRangeCalendar
          value={range}
          onChange={setRange}
          minValue={today(getLocalTimeZone())}
          maxValue={today(getLocalTimeZone()).add({ months: 12 })}
        />
        <div className="space-y-2 rounded-md bg-muted p-4">
          <div className="flex justify-between text-sm">
            <span>Check-in:</span>
            <span className="font-medium">
              {range?.start?.toString() || "Select dates"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Check-out:</span>
            <span className="font-medium">
              {range?.end?.toString() || "Select dates"}
            </span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Total Days:</span>
              <span>{calculateDays()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
