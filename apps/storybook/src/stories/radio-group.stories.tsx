import * as React from "react";
import { FormRadioGroup, Radio, RadioGroup } from "@repo/ui/radio-group";

import type { Meta, StoryObj } from "@storybook/react";

/**
 * RadioGroup component based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation support (Arrow keys to navigate, Space to select)
 * - ARIA attributes built-in for accessibility
 * - Single selection from multiple options
 * - Horizontal and vertical orientations
 * - Validation and error states
 * - Accessible by default
 *
 * Common use cases:
 * - Single-choice questions
 * - Settings with exclusive options
 * - Payment method selection
 * - Shipping options
 *
 * @see https://react-spectrum.adobe.com/react-aria/RadioGroup.html
 */
const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Layout orientation",
      table: {
        defaultValue: { summary: "vertical" },
      },
    },
    isDisabled: {
      control: "boolean",
      description: "Whether the radio group is disabled",
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default vertical radio group
 */
export const Default: Story = {
  render: () => (
    <RadioGroup>
      <Radio value="option1">Option 1</Radio>
      <Radio value="option2">Option 2</Radio>
      <Radio value="option3">Option 3</Radio>
    </RadioGroup>
  ),
};

/**
 * Horizontal orientation
 */
export const Horizontal: Story = {
  render: () => (
    <RadioGroup orientation="horizontal">
      <Radio value="small">Small</Radio>
      <Radio value="medium">Medium</Radio>
      <Radio value="large">Large</Radio>
    </RadioGroup>
  ),
};

/**
 * Vertical orientation (default)
 */
export const Vertical: Story = {
  render: () => (
    <RadioGroup orientation="vertical">
      <Radio value="option1">Option 1</Radio>
      <Radio value="option2">Option 2</Radio>
      <Radio value="option3">Option 3</Radio>
    </RadioGroup>
  ),
};

/**
 * With default value selected
 */
export const WithDefaultValue: Story = {
  render: () => (
    <RadioGroup defaultValue="option2">
      <Radio value="option1">Option 1</Radio>
      <Radio value="option2">Option 2 (Default)</Radio>
      <Radio value="option3">Option 3</Radio>
    </RadioGroup>
  ),
};

/**
 * Disabled radio group
 */
export const Disabled: Story = {
  render: () => (
    <RadioGroup isDisabled>
      <Radio value="option1">Option 1</Radio>
      <Radio value="option2">Option 2</Radio>
      <Radio value="option3">Option 3</Radio>
    </RadioGroup>
  ),
};

/**
 * Individual disabled radio
 */
export const IndividualDisabled: Story = {
  render: () => (
    <RadioGroup>
      <Radio value="option1">Option 1</Radio>
      <Radio
        value="option2"
        isDisabled
      >
        Option 2 (Disabled)
      </Radio>
      <Radio value="option3">Option 3</Radio>
    </RadioGroup>
  ),
};

/**
 * Form radio group with label
 */
export const FormGroupWithLabel: Story = {
  render: () => (
    <FormRadioGroup
      label="Choose your plan"
      description="Select the plan that works best for you"
      className="w-[300px]"
    >
      <Radio value="free">Free</Radio>
      <Radio value="pro">Pro</Radio>
      <Radio value="enterprise">Enterprise</Radio>
    </FormRadioGroup>
  ),
};

/**
 * Form radio group with error
 */
export const FormGroupWithError: Story = {
  render: () => (
    <FormRadioGroup
      label="Select payment method"
      description="Choose how you want to pay"
      errorMessage="Please select a payment method"
      isInvalid
      className="w-[300px]"
    >
      <Radio value="card">Credit Card</Radio>
      <Radio value="paypal">PayPal</Radio>
      <Radio value="bank">Bank Transfer</Radio>
    </FormRadioGroup>
  ),
};

/**
 * Controlled radio group
 */
export const Controlled: Story = {
  render: () => {
    const [selected, setSelected] = React.useState("medium");

    return (
      <div className="space-y-4">
        <FormRadioGroup
          label="Size"
          description="Select your size"
          value={selected}
          onChange={setSelected}
          className="w-[300px]"
        >
          <Radio value="small">Small</Radio>
          <Radio value="medium">Medium</Radio>
          <Radio value="large">Large</Radio>
          <Radio value="xlarge">X-Large</Radio>
        </FormRadioGroup>
        <div className="w-[300px] rounded-md bg-muted p-4">
          <p className="text-sm font-medium">Selected: {selected}</p>
        </div>
      </div>
    );
  },
};

/**
 * Payment method selection
 */
export const PaymentMethods: Story = {
  render: () => (
    <FormRadioGroup
      label="Payment Method"
      description="How would you like to pay?"
      className="w-[350px]"
    >
      <Radio value="card">
        <div>
          <div className="font-medium">Credit Card</div>
          <div className="text-sm text-muted-foreground">
            Pay with Visa, Mastercard, or Amex
          </div>
        </div>
      </Radio>
      <Radio value="paypal">
        <div>
          <div className="font-medium">PayPal</div>
          <div className="text-sm text-muted-foreground">
            Fast and secure payment with PayPal
          </div>
        </div>
      </Radio>
      <Radio value="bank">
        <div>
          <div className="font-medium">Bank Transfer</div>
          <div className="text-sm text-muted-foreground">
            Direct transfer from your bank account
          </div>
        </div>
      </Radio>
    </FormRadioGroup>
  ),
};

/**
 * Shipping options
 */
export const ShippingOptions: Story = {
  render: () => (
    <FormRadioGroup
      label="Shipping Method"
      defaultValue="standard"
      className="w-[350px]"
    >
      <Radio value="standard">
        <div className="flex items-center justify-between w-[280px]">
          <div>
            <div className="font-medium">Standard Shipping</div>
            <div className="text-sm text-muted-foreground">
              5-7 business days
            </div>
          </div>
          <div className="font-medium">Free</div>
        </div>
      </Radio>
      <Radio value="express">
        <div className="flex items-center justify-between w-[280px]">
          <div>
            <div className="font-medium">Express Shipping</div>
            <div className="text-sm text-muted-foreground">
              2-3 business days
            </div>
          </div>
          <div className="font-medium">$9.99</div>
        </div>
      </Radio>
      <Radio value="overnight">
        <div className="flex items-center justify-between w-[280px]">
          <div>
            <div className="font-medium">Overnight Shipping</div>
            <div className="text-sm text-muted-foreground">
              Next business day
            </div>
          </div>
          <div className="font-medium">$24.99</div>
        </div>
      </Radio>
    </FormRadioGroup>
  ),
};

/**
 * Settings selection
 */
export const SettingsSelection: Story = {
  render: () => (
    <div className="w-[400px] space-y-6 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Preferences</h2>
      <FormRadioGroup
        label="Theme"
        description="Choose your interface theme"
        defaultValue="system"
      >
        <Radio value="light">Light</Radio>
        <Radio value="dark">Dark</Radio>
        <Radio value="system">System</Radio>
      </FormRadioGroup>
      <FormRadioGroup
        label="Language"
        description="Select your preferred language"
        defaultValue="en"
      >
        <Radio value="en">English</Radio>
        <Radio value="es">Español</Radio>
        <Radio value="fr">Français</Radio>
        <Radio value="de">Deutsch</Radio>
      </FormRadioGroup>
    </div>
  ),
};

/**
 * Survey question
 */
export const SurveyQuestion: Story = {
  render: () => (
    <div className="w-[400px] space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Customer Satisfaction Survey</h2>
      <FormRadioGroup
        label="How would you rate our service?"
        description="Please select one option"
        isRequired
      >
        <Radio value="excellent">⭐⭐⭐⭐⭐ Excellent</Radio>
        <Radio value="good">⭐⭐⭐⭐ Good</Radio>
        <Radio value="average">⭐⭐⭐ Average</Radio>
        <Radio value="poor">⭐⭐ Poor</Radio>
        <Radio value="very-poor">⭐ Very Poor</Radio>
      </FormRadioGroup>
    </div>
  ),
};

/**
 * Multi-step form
 */
export const MultiStepForm: Story = {
  render: () => {
    const [step, setStep] = React.useState(1);
    const [plan, setPlan] = React.useState("");
    const [billing, setBilling] = React.useState("");

    return (
      <div className="w-[400px] space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Subscribe - Step {step}/2</h2>
        {step === 1 && (
          <FormRadioGroup
            label="Select Plan"
            value={plan}
            onChange={setPlan}
            isRequired
          >
            <Radio value="basic">Basic - $9/month</Radio>
            <Radio value="pro">Pro - $29/month</Radio>
            <Radio value="enterprise">Enterprise - $99/month</Radio>
          </FormRadioGroup>
        )}
        {step === 2 && (
          <FormRadioGroup
            label="Billing Cycle"
            value={billing}
            onChange={setBilling}
            isRequired
          >
            <Radio value="monthly">Monthly</Radio>
            <Radio value="yearly">Yearly (Save 20%)</Radio>
          </FormRadioGroup>
        )}
        <div className="flex gap-2">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="h-10 rounded-md border px-4 py-2 text-sm font-medium"
            >
              Back
            </button>
          )}
          <button
            onClick={() => step < 2 && setStep(step + 1)}
            disabled={step === 1 ? !plan : !billing}
            className="h-10 flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {step === 2 ? "Complete" : "Next"}
          </button>
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
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm font-medium">Normal</p>
        <RadioGroup defaultValue="option1">
          <Radio value="option1">Selected</Radio>
          <Radio value="option2">Unselected</Radio>
        </RadioGroup>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Disabled Group</p>
        <RadioGroup
          defaultValue="option1"
          isDisabled
        >
          <Radio value="option1">Selected Disabled</Radio>
          <Radio value="option2">Unselected Disabled</Radio>
        </RadioGroup>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Individual Disabled</p>
        <RadioGroup defaultValue="option1">
          <Radio value="option1">Selected</Radio>
          <Radio
            value="option2"
            isDisabled
          >
            Disabled Option
          </Radio>
          <Radio value="option3">Normal</Radio>
        </RadioGroup>
      </div>
    </div>
  ),
};
