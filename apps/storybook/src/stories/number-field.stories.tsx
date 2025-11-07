import { FormNumberField } from "@repo/ui/number-field";
import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * NumberField component based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation (Arrow up/down to increment/decrement)
 * - ARIA attributes for accessibility
 * - Increment/decrement buttons
 * - Min/max value constraints
 * - Step increment control
 * - Formatting options (currency, percentage, etc.)
 * - Validation support
 * - Accessible by default
 *
 * Common use cases:
 * - Quantity selectors
 * - Price inputs
 * - Age fields
 * - Rating inputs
 * - Percentage inputs
 *
 * @see https://react-spectrum.adobe.com/react-aria/NumberField.html
 */
const meta = {
  title: "Components/NumberField",
  component: FormNumberField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "number",
      description: "Default number value",
    },
    minValue: {
      control: "number",
      description: "Minimum allowed value",
    },
    maxValue: {
      control: "number",
      description: "Maximum allowed value",
    },
    step: {
      control: "number",
      description: "Step increment amount",
      table: {
        defaultValue: { summary: 1 },
      },
    },
    isDisabled: {
      control: "boolean",
      description: "Whether the field is disabled",
    },
  },
} satisfies Meta<typeof FormNumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default number field
 */
export const Default: Story = {
  args: {
    label: "Amount",
    className: "w-[250px]",
  },
};

/**
 * With default value
 */
export const WithDefaultValue: Story = {
  args: {
    label: "Quantity",
    defaultValue: 5,
    className: "w-[250px]",
  },
};

/**
 * With min and max values
 */
export const WithMinMax: Story = {
  args: {
    label: "Age",
    description: "Must be between 18 and 100",
    defaultValue: 25,
    minValue: 18,
    maxValue: 100,
    className: "w-[250px]",
  },
};

/**
 * With step increment
 */
export const WithStep: Story = {
  args: {
    label: "Amount",
    description: "Increments by 10",
    defaultValue: 50,
    step: 10,
    className: "w-[250px]",
  },
};

/**
 * Disabled field
 */
export const Disabled: Story = {
  args: {
    label: "Disabled",
    defaultValue: 10,
    isDisabled: true,
    className: "w-[250px]",
  },
};

/**
 * With error
 */
export const WithError: Story = {
  args: {
    label: "Quantity",
    description: "Enter a valid quantity",
    errorMessage: "Quantity must be at least 1",
    isInvalid: true,
    className: "w-[250px]",
  },
};

/**
 * Required field
 */
export const Required: Story = {
  args: {
    label: "Number of guests",
    description: "This field is required",
    isRequired: true,
    className: "w-[250px]",
  },
};

/**
 * Currency format
 */
export const Currency: Story = {
  render: () => (
    <FormNumberField
      label="Price"
      defaultValue={99.99}
      minValue={0}
      step={0.01}
      formatOptions={{
        style: "currency",
        currency: "USD",
      }}
      className="w-[250px]"
    />
  ),
};

/**
 * Percentage format
 */
export const Percentage: Story = {
  render: () => (
    <FormNumberField
      label="Discount"
      defaultValue={15}
      minValue={0}
      maxValue={100}
      formatOptions={{
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }}
      className="w-[250px]"
    />
  ),
};

/**
 * Controlled number field
 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState(10);

    return (
      <div className="space-y-4">
        <FormNumberField
          label="Quantity"
          value={value}
          onChange={setValue}
          minValue={0}
          maxValue={99}
          className="w-[250px]"
        />
        <div className="w-[250px] rounded-md bg-muted p-4">
          <p className="text-sm font-medium">Current value: {value}</p>
          <button
            onClick={() => setValue(25)}
            className="mt-2 h-8 rounded-md bg-primary px-3 text-sm text-primary-foreground"
          >
            Set to 25
          </button>
        </div>
      </div>
    );
  },
};

/**
 * Quantity selector
 */
export const QuantitySelector: Story = {
  render: () => (
    <div className="w-[350px] space-y-4 rounded-lg border p-6">
      <div className="flex items-center gap-4">
        <img
          src="https://via.placeholder.com/80"
          alt="Product"
          className="h-20 w-20 rounded-md bg-muted"
        />
        <div className="flex-1">
          <h3 className="font-semibold">Product Name</h3>
          <p className="text-sm text-muted-foreground">$29.99</p>
        </div>
      </div>
      <FormNumberField
        label="Quantity"
        defaultValue={1}
        minValue={1}
        maxValue={10}
        className="w-full"
      />
      <button className="h-10 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        Add to Cart
      </button>
    </div>
  ),
};

/**
 * Order form with multiple number fields
 */
export const OrderForm: Story = {
  render: () => (
    <form className="w-[350px] space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Place Order</h2>
      <FormNumberField
        label="Quantity"
        description="How many items do you want?"
        defaultValue={1}
        minValue={1}
        maxValue={100}
        isRequired
      />
      <FormNumberField
        label="Tip Amount"
        description="Optional tip for delivery"
        defaultValue={0}
        minValue={0}
        step={0.5}
        formatOptions={{
          style: "currency",
          currency: "USD",
        }}
      />
      <FormNumberField
        label="Discount Code"
        description="Enter discount percentage if you have one"
        defaultValue={0}
        minValue={0}
        maxValue={100}
        formatOptions={{
          style: "percent",
          minimumFractionDigits: 0,
        }}
      />
      <button
        type="submit"
        className="h-10 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Complete Order
      </button>
    </form>
  ),
};

/**
 * Ratings input
 */
export const RatingsInput: Story = {
  render: () => (
    <div className="w-[300px] space-y-4 rounded-lg border p-6">
      <h3 className="text-lg font-semibold">Rate Our Service</h3>
      <FormNumberField
        label="Overall Rating"
        description="Rate from 1 to 5 stars"
        defaultValue={4}
        minValue={1}
        maxValue={5}
      />
      <FormNumberField
        label="Quality Rating"
        description="Rate from 1 to 10"
        defaultValue={8}
        minValue={1}
        maxValue={10}
      />
      <button className="h-10 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        Submit Rating
      </button>
    </div>
  ),
};

/**
 * Settings with number fields
 */
export const SettingsPanel: Story = {
  render: () => (
    <div className="w-[400px] space-y-6 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Display Settings</h2>
      <FormNumberField
        label="Font Size"
        description="Size in pixels"
        defaultValue={16}
        minValue={12}
        maxValue={24}
      />
      <FormNumberField
        label="Line Height"
        description="Line height multiplier"
        defaultValue={1.5}
        minValue={1}
        maxValue={3}
        step={0.1}
      />
      <FormNumberField
        label="Items Per Page"
        description="Number of items to show"
        defaultValue={20}
        minValue={10}
        maxValue={100}
        step={10}
      />
    </div>
  ),
};

/**
 * Product pricing
 */
export const ProductPricing: Story = {
  render: () => {
    const [price, setPrice] = React.useState(99.99);
    const [quantity, setQuantity] = React.useState(1);
    const total = price * quantity;

    return (
      <div className="w-[350px] space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Product Details</h2>
        <FormNumberField
          label="Unit Price"
          value={price}
          onChange={setPrice}
          minValue={0.01}
          step={0.01}
          formatOptions={{
            style: "currency",
            currency: "USD",
          }}
        />
        <FormNumberField
          label="Quantity"
          value={quantity}
          onChange={setQuantity}
          minValue={1}
          maxValue={999}
        />
        <div className="rounded-md bg-muted p-4">
          <div className="flex justify-between">
            <span className="font-medium">Total:</span>
            <span className="text-lg font-bold">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  },
};

/**
 * All states showcase
 */
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <FormNumberField
        label="Normal"
        defaultValue={10}
        className="w-[250px]"
      />
      <FormNumberField
        label="Disabled"
        defaultValue={10}
        isDisabled
        className="w-[250px]"
      />
      <FormNumberField
        label="Required"
        isRequired
        className="w-[250px]"
      />
      <FormNumberField
        label="With Error"
        errorMessage="Invalid value"
        isInvalid
        className="w-[250px]"
      />
      <FormNumberField
        label="With Min/Max"
        description="Between 0 and 100"
        defaultValue={50}
        minValue={0}
        maxValue={100}
        className="w-[250px]"
      />
    </div>
  ),
};
