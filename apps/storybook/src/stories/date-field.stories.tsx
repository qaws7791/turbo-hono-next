import { Time, parseDate } from "@internationalized/date";
import { FormDateField, FormTimeField } from "@repo/ui/date-field";

import type { Meta, StoryObj } from "@storybook/react";

/**
 * DateField and TimeField components based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation (Arrow keys to navigate segments, up/down to increment/decrement)
 * - ARIA attributes for accessibility
 * - Localized date/time formatting
 * - Individual segment editing
 * - Min/max date validation
 * - Accessible by default
 *
 * Common use cases:
 * - Birth date input
 * - Appointment date/time selection
 * - Event scheduling
 * - Booking systems
 * - Form date fields
 *
 * @see https://react-spectrum.adobe.com/react-aria/DateField.html
 */
const meta = {
  title: "Components/DateField",
  component: FormDateField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FormDateField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default date field
 */
export const Default: Story = {
  render: () => (
    <FormDateField
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
    <FormDateField
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
    <FormDateField
      label="Event Date"
      description="Select the date of your event"
      className="w-[250px]"
    />
  ),
};

/**
 * With error
 */
export const WithError: Story = {
  render: () => (
    <FormDateField
      label="Date"
      description="Enter a valid date"
      errorMessage="This date is invalid"
      isInvalid
      className="w-[250px]"
    />
  ),
};

/**
 * Required field
 */
export const Required: Story = {
  render: () => (
    <FormDateField
      label="Appointment Date"
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
    <FormDateField
      label="Date"
      defaultValue={parseDate("2024-01-15")}
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
    <FormDateField
      label="Booking Date"
      description="Must be between today and 30 days from now"
      minValue={parseDate("2024-01-01")}
      maxValue={parseDate("2024-12-31")}
      className="w-[250px]"
    />
  ),
};

/**
 * Time field
 */
export const TimeField: Story = {
  render: () => (
    <FormTimeField
      label="Time"
      className="w-[250px]"
    />
  ),
};

/**
 * Time field with default value
 */
export const TimeFieldWithValue: Story = {
  render: () => {
    return (
      <FormTimeField
        label="Meeting Time"
        defaultValue={new Time(14, 30)}
        className="w-[250px]"
      />
    );
  },
};

/**
 * Appointment booking form
 */
export const AppointmentForm: Story = {
  render: () => (
    <form className="w-[350px] space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Book Appointment</h2>
      <FormDateField
        label="Appointment Date"
        description="Select your preferred date"
        isRequired
      />
      <FormTimeField
        label="Appointment Time"
        description="Select your preferred time"
        isRequired
      />
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
        Book Appointment
      </button>
    </form>
  ),
};

/**
 * Event creation form
 */
export const EventForm: Story = {
  render: () => (
    <form className="w-[350px] space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Create Event</h2>
      <div className="space-y-2">
        <label className="text-sm font-medium">Event Name</label>
        <input
          type="text"
          placeholder="Enter event name"
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <FormDateField
        label="Start Date"
        isRequired
      />
      <FormTimeField
        label="Start Time"
        isRequired
      />
      <FormDateField
        label="End Date"
        isRequired
      />
      <FormTimeField
        label="End Time"
        isRequired
      />
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
 * Profile form with birth date
 */
export const ProfileForm: Story = {
  render: () => (
    <form className="w-[350px] space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Personal Information</h2>
      <div className="space-y-2">
        <label className="text-sm font-medium">Full Name</label>
        <input
          type="text"
          placeholder="Enter your name"
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <FormDateField
        label="Date of Birth"
        description="You must be 18 years or older"
        isRequired
        maxValue={parseDate("2006-01-01")}
      />
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          placeholder="your@email.com"
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        className="h-10 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Save Profile
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
      <FormDateField
        label="Normal"
        className="w-[250px]"
      />
      <FormDateField
        label="With Value"
        defaultValue={parseDate("2024-06-15")}
        className="w-[250px]"
      />
      <FormDateField
        label="Disabled"
        defaultValue={parseDate("2024-06-15")}
        isDisabled
        className="w-[250px]"
      />
      <FormDateField
        label="Required"
        isRequired
        className="w-[250px]"
      />
      <FormDateField
        label="With Error"
        errorMessage="Invalid date"
        isInvalid
        className="w-[250px]"
      />
    </div>
  ),
};
