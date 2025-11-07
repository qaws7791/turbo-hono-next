import {
  FormSelect,
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectSection,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Select component based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation (Arrow keys, type to search)
 * - ARIA attributes for accessibility
 * - Single selection from options
 * - Searchable by typing
 * - Grouped options with sections
 * - Validation and error states
 * - Accessible by default
 *
 * Common use cases:
 * - Country/region selection
 * - Category filters
 * - Status dropdowns
 * - Settings options
 * - Form fields
 *
 * @see https://react-spectrum.adobe.com/react-aria/Select.html
 */
const meta = {
  title: "Components/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isDisabled: {
      control: "boolean",
      description: "Whether the select is disabled",
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default select with simple options
 */
export const Default: Story = {
  render: () => (
    <Select className="w-[250px]">
      <SelectTrigger>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectPopover>
        <SelectListBox>
          <SelectItem id="option1">Option 1</SelectItem>
          <SelectItem id="option2">Option 2</SelectItem>
          <SelectItem id="option3">Option 3</SelectItem>
        </SelectListBox>
      </SelectPopover>
    </Select>
  ),
};

/**
 * With default value selected
 */
export const WithDefaultValue: Story = {
  render: () => (
    <Select
      defaultSelectedKey="medium"
      className="w-[250px]"
    >
      <SelectTrigger>
        <SelectValue placeholder="Select size" />
      </SelectTrigger>
      <SelectPopover>
        <SelectListBox>
          <SelectItem id="small">Small</SelectItem>
          <SelectItem id="medium">Medium</SelectItem>
          <SelectItem id="large">Large</SelectItem>
        </SelectListBox>
      </SelectPopover>
    </Select>
  ),
};

/**
 * Disabled select
 */
export const Disabled: Story = {
  render: () => (
    <Select
      isDisabled
      className="w-[250px]"
    >
      <SelectTrigger>
        <SelectValue placeholder="Disabled select" />
      </SelectTrigger>
      <SelectPopover>
        <SelectListBox>
          <SelectItem id="option1">Option 1</SelectItem>
          <SelectItem id="option2">Option 2</SelectItem>
        </SelectListBox>
      </SelectPopover>
    </Select>
  ),
};

/**
 * Form select with label
 */
export const FormSelectBasic: Story = {
  render: () => (
    <FormSelect
      label="Country"
      placeholder="Select country"
      className="w-[250px]"
    >
      <SelectItem id="us">United States</SelectItem>
      <SelectItem id="uk">United Kingdom</SelectItem>
      <SelectItem id="ca">Canada</SelectItem>
      <SelectItem id="au">Australia</SelectItem>
    </FormSelect>
  ),
};

/**
 * Form select with description
 */
export const WithDescription: Story = {
  render: () => (
    <FormSelect
      label="Language"
      description="Choose your preferred language"
      placeholder="Select language"
      className="w-[250px]"
    >
      <SelectItem id="en">English</SelectItem>
      <SelectItem id="es">Español</SelectItem>
      <SelectItem id="fr">Français</SelectItem>
      <SelectItem id="de">Deutsch</SelectItem>
    </FormSelect>
  ),
};

/**
 * Form select with error
 */
export const WithError: Story = {
  render: () => (
    <FormSelect
      label="Status"
      description="Select project status"
      errorMessage="Please select a status"
      isInvalid
      placeholder="Select status"
      className="w-[250px]"
    >
      <SelectItem id="active">Active</SelectItem>
      <SelectItem id="pending">Pending</SelectItem>
      <SelectItem id="completed">Completed</SelectItem>
    </FormSelect>
  ),
};

/**
 * Required field
 */
export const Required: Story = {
  render: () => (
    <FormSelect
      label="Category"
      description="This field is required"
      placeholder="Select category"
      isRequired
      className="w-[250px]"
    >
      <SelectItem id="tech">Technology</SelectItem>
      <SelectItem id="design">Design</SelectItem>
      <SelectItem id="marketing">Marketing</SelectItem>
      <SelectItem id="sales">Sales</SelectItem>
    </FormSelect>
  ),
};

/**
 * Grouped options with sections
 */
export const GroupedOptions: Story = {
  render: () => (
    <Select className="w-[250px]">
      <SelectTrigger>
        <SelectValue placeholder="Select fruit" />
      </SelectTrigger>
      <SelectPopover>
        <SelectListBox>
          <SelectSection title="Citrus">
            <SelectItem id="orange">Orange</SelectItem>
            <SelectItem id="lemon">Lemon</SelectItem>
            <SelectItem id="lime">Lime</SelectItem>
          </SelectSection>
          <SelectSection title="Berries">
            <SelectItem id="strawberry">Strawberry</SelectItem>
            <SelectItem id="blueberry">Blueberry</SelectItem>
            <SelectItem id="raspberry">Raspberry</SelectItem>
          </SelectSection>
          <SelectSection title="Tropical">
            <SelectItem id="mango">Mango</SelectItem>
            <SelectItem id="pineapple">Pineapple</SelectItem>
            <SelectItem id="papaya">Papaya</SelectItem>
          </SelectSection>
        </SelectListBox>
      </SelectPopover>
    </Select>
  ),
};

/**
 * Controlled select
 */
export const Controlled: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<React.Key>("medium");

    return (
      <div className="space-y-4">
        <FormSelect
          label="Size"
          selectedKey={selected}
          onSelectionChange={setSelected}
          className="w-[250px]"
        >
          <SelectItem id="small">Small</SelectItem>
          <SelectItem id="medium">Medium</SelectItem>
          <SelectItem id="large">Large</SelectItem>
          <SelectItem id="xlarge">X-Large</SelectItem>
        </FormSelect>
        <div className="w-[250px] rounded-md bg-muted p-4">
          <p className="text-sm font-medium">Selected: {selected}</p>
        </div>
      </div>
    );
  },
};

/**
 * Country selector
 */
export const CountrySelector: Story = {
  render: () => (
    <FormSelect
      label="Country/Region"
      description="Select your country or region"
      placeholder="Select country"
      className="w-[300px]"
    >
      <SelectSection title="North America">
        <SelectItem id="us">🇺🇸 United States</SelectItem>
        <SelectItem id="ca">🇨🇦 Canada</SelectItem>
        <SelectItem id="mx">🇲🇽 Mexico</SelectItem>
      </SelectSection>
      <SelectSection title="Europe">
        <SelectItem id="uk">🇬🇧 United Kingdom</SelectItem>
        <SelectItem id="fr">🇫🇷 France</SelectItem>
        <SelectItem id="de">🇩🇪 Germany</SelectItem>
        <SelectItem id="es">🇪🇸 Spain</SelectItem>
      </SelectSection>
      <SelectSection title="Asia">
        <SelectItem id="jp">🇯🇵 Japan</SelectItem>
        <SelectItem id="kr">🇰🇷 South Korea</SelectItem>
        <SelectItem id="cn">🇨🇳 China</SelectItem>
      </SelectSection>
    </FormSelect>
  ),
};

/**
 * Priority selector
 */
export const PrioritySelector: Story = {
  render: () => (
    <FormSelect
      label="Priority"
      defaultSelectedKey="medium"
      className="w-[250px]"
    >
      <SelectItem id="low">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Low
        </div>
      </SelectItem>
      <SelectItem id="medium">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-yellow-500" />
          Medium
        </div>
      </SelectItem>
      <SelectItem id="high">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          High
        </div>
      </SelectItem>
      <SelectItem id="critical">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Critical
        </div>
      </SelectItem>
    </FormSelect>
  ),
};

/**
 * Form with multiple selects
 */
export const FormWithMultipleSelects: Story = {
  render: () => (
    <form className="w-[350px] space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Shipping Information</h2>
      <FormSelect
        label="Country"
        placeholder="Select country"
        isRequired
      >
        <SelectItem id="us">United States</SelectItem>
        <SelectItem id="uk">United Kingdom</SelectItem>
        <SelectItem id="ca">Canada</SelectItem>
      </FormSelect>
      <FormSelect
        label="State/Province"
        placeholder="Select state"
        isRequired
      >
        <SelectItem id="ca">California</SelectItem>
        <SelectItem id="ny">New York</SelectItem>
        <SelectItem id="tx">Texas</SelectItem>
        <SelectItem id="fl">Florida</SelectItem>
      </FormSelect>
      <FormSelect
        label="Shipping Method"
        placeholder="Select method"
        isRequired
      >
        <SelectItem id="standard">Standard (5-7 days)</SelectItem>
        <SelectItem id="express">Express (2-3 days)</SelectItem>
        <SelectItem id="overnight">Overnight</SelectItem>
      </FormSelect>
      <button
        type="submit"
        className="h-10 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Continue
      </button>
    </form>
  ),
};

/**
 * Settings panel with selects
 */
export const SettingsPanel: Story = {
  render: () => (
    <div className="w-[400px] space-y-6 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Preferences</h2>
      <FormSelect
        label="Theme"
        description="Choose your interface theme"
        defaultSelectedKey="system"
      >
        <SelectItem id="light">Light</SelectItem>
        <SelectItem id="dark">Dark</SelectItem>
        <SelectItem id="system">System</SelectItem>
      </FormSelect>
      <FormSelect
        label="Language"
        description="Select your preferred language"
        defaultSelectedKey="en"
      >
        <SelectItem id="en">English</SelectItem>
        <SelectItem id="es">Español</SelectItem>
        <SelectItem id="fr">Français</SelectItem>
        <SelectItem id="de">Deutsch</SelectItem>
      </FormSelect>
      <FormSelect
        label="Timezone"
        description="Choose your timezone"
        defaultSelectedKey="utc"
      >
        <SelectItem id="utc">UTC</SelectItem>
        <SelectItem id="est">Eastern Time (EST)</SelectItem>
        <SelectItem id="cst">Central Time (CST)</SelectItem>
        <SelectItem id="pst">Pacific Time (PST)</SelectItem>
      </FormSelect>
    </div>
  ),
};

/**
 * Filter with select
 */
export const FilterPanel: Story = {
  render: () => {
    const [category, setCategory] = React.useState<React.Key>("all");
    const [sort, setSort] = React.useState<React.Key>("newest");

    return (
      <div className="w-[500px] space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Products</h2>
        <div className="flex gap-4">
          <FormSelect
            label="Category"
            selectedKey={category}
            onSelectionChange={setCategory}
            className="flex-1"
          >
            <SelectItem id="all">All Categories</SelectItem>
            <SelectItem id="electronics">Electronics</SelectItem>
            <SelectItem id="clothing">Clothing</SelectItem>
            <SelectItem id="books">Books</SelectItem>
            <SelectItem id="home">Home & Garden</SelectItem>
          </FormSelect>
          <FormSelect
            label="Sort By"
            selectedKey={sort}
            onSelectionChange={setSort}
            className="flex-1"
          >
            <SelectItem id="newest">Newest First</SelectItem>
            <SelectItem id="oldest">Oldest First</SelectItem>
            <SelectItem id="price-low">Price: Low to High</SelectItem>
            <SelectItem id="price-high">Price: High to Low</SelectItem>
            <SelectItem id="popular">Most Popular</SelectItem>
          </FormSelect>
        </div>
        <div className="rounded-md bg-muted p-4">
          <p className="text-sm">
            Showing: {category === "all" ? "All Categories" : category} | Sort:{" "}
            {sort}
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Many options (scrollable)
 */
export const ManyOptions: Story = {
  render: () => (
    <FormSelect
      label="City"
      description="Select a city"
      placeholder="Select city"
      className="w-[250px]"
    >
      {Array.from({ length: 50 }, (_, i) => (
        <SelectItem
          key={`city-${i}`}
          id={`city-${i}`}
        >
          City {i + 1}
        </SelectItem>
      ))}
    </FormSelect>
  ),
};
