import { Checkbox, CheckboxGroup, FormCheckboxGroup } from "@repo/ui/checkbox";
import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

/**
 * Checkbox component based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation support (Space to toggle)
 * - ARIA attributes built-in for accessibility
 * - Supports checked, indeterminate, and unchecked states
 * - Validation and error states
 * - Group support for related checkboxes
 * - Accessible by default
 *
 * @see https://react-spectrum.adobe.com/react-aria/Checkbox.html
 */
const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
      description: "Label text for the checkbox",
    },
    isDisabled: {
      control: "boolean",
      description: "Whether the checkbox is disabled",
    },
    isSelected: {
      control: "boolean",
      description: "Whether the checkbox is checked",
    },
    isIndeterminate: {
      control: "boolean",
      description: "Whether the checkbox is in indeterminate state",
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default checkbox with label
 */
export const Default: Story = {
  args: {
    children: "Accept terms and conditions",
  },
};

/**
 * Checked checkbox
 */
export const Checked: Story = {
  args: {
    children: "Checked checkbox",
    isSelected: true,
  },
};

/**
 * Indeterminate checkbox - useful for "select all" scenarios
 */
export const Indeterminate: Story = {
  args: {
    children: "Indeterminate checkbox",
    isIndeterminate: true,
  },
};

/**
 * Disabled checkbox
 */
export const Disabled: Story = {
  args: {
    children: "Disabled checkbox",
    isDisabled: true,
  },
};

/**
 * Disabled and checked
 */
export const DisabledChecked: Story = {
  args: {
    children: "Disabled checked checkbox",
    isDisabled: true,
    isSelected: true,
  },
};

/**
 * Checkbox without label
 */
export const WithoutLabel: Story = {
  args: {},
};

/**
 * Multiple checkboxes
 */
export const MultipleCheckboxes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox>Option 1</Checkbox>
      <Checkbox>Option 2</Checkbox>
      <Checkbox>Option 3</Checkbox>
    </div>
  ),
};

/**
 * All states showcase
 */
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox>Unchecked</Checkbox>
      <Checkbox isSelected>Checked</Checkbox>
      <Checkbox isIndeterminate>Indeterminate</Checkbox>
      <Checkbox isDisabled>Disabled</Checkbox>
      <Checkbox
        isDisabled
        isSelected
      >
        Disabled Checked
      </Checkbox>
    </div>
  ),
};

/**
 * Basic checkbox group
 */
export const BasicGroup: Story = {
  render: () => (
    <CheckboxGroup>
      <Checkbox value="option1">Option 1</Checkbox>
      <Checkbox value="option2">Option 2</Checkbox>
      <Checkbox value="option3">Option 3</Checkbox>
    </CheckboxGroup>
  ),
};

/**
 * Form checkbox group with label and description
 */
export const FormGroup: Story = {
  render: () => (
    <FormCheckboxGroup
      label="Select your preferences"
      description="Choose one or more options"
    >
      <Checkbox value="newsletter">Receive newsletter</Checkbox>
      <Checkbox value="updates">Product updates</Checkbox>
      <Checkbox value="promotions">Promotional offers</Checkbox>
    </FormCheckboxGroup>
  ),
};

/**
 * Form checkbox group with error
 */
export const FormGroupWithError: Story = {
  render: () => (
    <FormCheckboxGroup
      label="Required selection"
      description="Select at least one option"
      errorMessage="Please select at least one option"
      isInvalid
    >
      <Checkbox value="option1">Option 1</Checkbox>
      <Checkbox value="option2">Option 2</Checkbox>
      <Checkbox value="option3">Option 3</Checkbox>
    </FormCheckboxGroup>
  ),
};

/**
 * Controlled checkbox group
 */
export const ControlledGroup: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<Array<string>>([
      "option1",
      "option2",
    ]);

    return (
      <div className="space-y-4">
        <FormCheckboxGroup
          label="Select features"
          description="Choose features to enable"
          value={selected}
          onChange={setSelected}
        >
          <Checkbox value="option1">Feature 1</Checkbox>
          <Checkbox value="option2">Feature 2</Checkbox>
          <Checkbox value="option3">Feature 3</Checkbox>
          <Checkbox value="option4">Feature 4</Checkbox>
        </FormCheckboxGroup>
        <div className="rounded-md bg-muted p-4">
          <p className="text-sm font-medium">Selected: {selected.join(", ")}</p>
        </div>
      </div>
    );
  },
};

/**
 * Select all pattern with indeterminate state
 */
export const SelectAllPattern: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<Array<string>>(["item1"]);
    const allItems = ["item1", "item2", "item3"];

    const allSelected = selected.length === allItems.length;
    const someSelected =
      selected.length > 0 && selected.length < allItems.length;

    const handleSelectAll = (isSelected: boolean) => {
      if (isSelected) {
        setSelected(allItems);
      } else {
        setSelected([]);
      }
    };

    return (
      <div className="space-y-4">
        <Checkbox
          isSelected={allSelected}
          isIndeterminate={someSelected}
          onChange={handleSelectAll}
        >
          <strong>Select All</strong>
        </Checkbox>
        <div className="ml-6 flex flex-col gap-2">
          <CheckboxGroup
            value={selected}
            onChange={setSelected}
          >
            <Checkbox value="item1">Item 1</Checkbox>
            <Checkbox value="item2">Item 2</Checkbox>
            <Checkbox value="item3">Item 3</Checkbox>
          </CheckboxGroup>
        </div>
      </div>
    );
  },
};

/**
 * Checkbox in a form context
 */
export const InFormContext: Story = {
  render: () => (
    <form className="w-[400px] space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Sign Up</h2>
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-4">
        <Checkbox>
          I agree to the{" "}
          <a
            href="#"
            className="underline"
          >
            terms and conditions
          </a>
        </Checkbox>
        <Checkbox>Subscribe to newsletter</Checkbox>
      </div>
      <button
        type="submit"
        className="h-10 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Sign Up
      </button>
    </form>
  ),
};

/**
 * With long label text
 */
export const LongLabel: Story = {
  render: () => (
    <div className="w-[400px]">
      <Checkbox>
        I have read and agree to the terms of service, privacy policy, and
        cookie policy. I understand that my data will be processed in accordance
        with these policies.
      </Checkbox>
    </div>
  ),
};
