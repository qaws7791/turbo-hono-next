import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { JollyDatePicker, JollyDateRangePicker } from "@repo/ui/date-picker";
import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * DatePicker components based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation
 * - ARIA attributes for accessibility
 * - Calendar popup with date input field
 * - Single date and date range selection
 * - Min/max date constraints
 * - Validation support
 * - Accessible by default
 *
 * Components:
 * - JollyDatePicker: Single date selection with popup calendar
 * - JollyDateRangePicker: Date range selection with popup calendar
 *
 * Common use cases:
 * - Form date inputs
 * - Booking systems
 * - Event scheduling
 * - Date range filters
 * - Reservation systems
 *
 * @see https://react-spectrum.adobe.com/react-aria/DatePicker.html
 */
const meta = {
  title: "Components/DatePicker",
  component: JollyDatePicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof JollyDatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default date picker
 */
export const Default: Story = {
  render: () => (
    <JollyDatePicker
      label="Date"
      className="w-[250px]"
    />
  ),
};

/**
 * With default value
 */
export const WithDefaultValue: Story = {
  render: () => (
    <JollyDatePicker
      label="Birth Date"
      defaultValue={parseDate("1990-01-01")}
      className="w-[250px]"
    />
  ),
};

/**
 * With description
 */
export const WithDescription: Story = {
  render: () => (
    <JollyDatePicker
      label="Appointment Date"
      description="Select your preferred date"
      className="w-[250px]"
    />
  ),
};

/**
 * Required field
 */
export const Required: Story = {
  render: () => (
    <JollyDatePicker
      label="Event Date"
      description="This field is required"
      isRequired
      className="w-[250px]"
    />
  ),
};

/**
 * Disabled field
 */
export const Disabled: Story = {
  render: () => (
    <JollyDatePicker
      label="Date"
      defaultValue={parseDate("2024-06-15")}
      isDisabled
      className="w-[250px]"
    />
  ),
};

/**
 * With min and max dates
 */
export const WithMinMax: Story = {
  render: () => (
    <JollyDatePicker
      label="Booking Date"
      description="Available for the next 30 days"
      minValue={today(getLocalTimeZone())}
      maxValue={today(getLocalTimeZone()).add({ days: 30 })}
      className="w-[250px]"
    />
  ),
};

/**
 * Date range picker
 */
export const RangePicker: Story = {
  render: () => (
    <JollyDateRangePicker
      label="Date Range"
      className="w-[300px]"
    />
  ),
};

/**
 * Range picker with default value
 */
export const RangeWithDefaultValue: Story = {
  render: () => (
    <JollyDateRangePicker
      label="Vacation Dates"
      defaultValue={{
        start: parseDate("2024-07-01"),
        end: parseDate("2024-07-15"),
      }}
      className="w-[300px]"
    />
  ),
};

/**
 * Booking form
 */
export const BookingForm: Story = {
  render: () => (
    <form className="w-[350px] space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Book Appointment</h2>
      <JollyDatePicker
        label="Preferred Date"
        description="Choose your appointment date"
        minValue={today(getLocalTimeZone())}
        isRequired
      />
      <div className="space-y-2">
        <label className="text-sm font-medium">Time Slot</label>
        <select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option>Morning (9:00 AM - 12:00 PM)</option>
          <option>Afternoon (1:00 PM - 5:00 PM)</option>
          <option>Evening (6:00 PM - 9:00 PM)</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <textarea
          placeholder="Any special requests..."
          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        className="h-10 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Confirm Booking
      </button>
    </form>
  ),
};

/**
 * Hotel reservation form
 */
export const HotelReservation: Story = {
  render: () => {
    const [range, setRange] = React.useState(null);

    const calculateNights = () => {
      if (!range) return 0;
      return range.end.compare(range.start);
    };

    return (
      <form className="w-[400px] space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Hotel Reservation</h2>
        <JollyDateRangePicker
          label="Stay Dates"
          description="Check-in and check-out dates"
          value={range}
          onChange={setRange}
          minValue={today(getLocalTimeZone())}
          isRequired
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Adults</label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4+</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Children</label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option>0</option>
              <option>1</option>
              <option>2</option>
              <option>3+</option>
            </select>
          </div>
        </div>
        {range && (
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm font-medium">
              Total: {calculateNights()} night
              {calculateNights() !== 1 ? "s" : ""}
            </p>
          </div>
        )}
        <button
          type="submit"
          className="h-10 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Check Availability
        </button>
      </form>
    );
  },
};

/**
 * Filter with date range
 */
export const FilterPanel: Story = {
  render: () => {
    const [range, setRange] = React.useState(null);

    return (
      <div className="w-[400px] space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Filter Reports</h2>
        <JollyDateRangePicker
          label="Date Range"
          description="Select the period for the report"
          value={range}
          onChange={setRange}
        />
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Type</label>
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>Sales Report</option>
            <option>User Activity</option>
            <option>Revenue Report</option>
            <option>Traffic Report</option>
          </select>
        </div>
        <button className="h-10 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Generate Report
        </button>
      </div>
    );
  },
};

/**
 * Event creation form
 */
export const EventForm: Story = {
  render: () => (
    <form className="w-[400px] space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Create Event</h2>
      <div className="space-y-2">
        <label className="text-sm font-medium">Event Name</label>
        <input
          type="text"
          placeholder="Enter event name"
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <JollyDatePicker
        label="Event Date"
        description="When will this event take place?"
        minValue={today(getLocalTimeZone())}
        isRequired
      />
      <div className="space-y-2">
        <label className="text-sm font-medium">Location</label>
        <input
          type="text"
          placeholder="Enter location"
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          placeholder="Event description..."
          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        className="h-10 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Create Event
      </button>
    </form>
  ),
};

/**
 * All states showcase
 */
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <JollyDatePicker
        label="Normal"
        className="w-[250px]"
      />
      <JollyDatePicker
        label="With Value"
        defaultValue={parseDate("2024-06-15")}
        className="w-[250px]"
      />
      <JollyDatePicker
        label="Disabled"
        defaultValue={parseDate("2024-06-15")}
        isDisabled
        className="w-[250px]"
      />
      <JollyDatePicker
        label="Required"
        isRequired
        className="w-[250px]"
      />
      <JollyDateRangePicker
        label="Date Range"
        className="w-[300px]"
      />
    </div>
  ),
};
