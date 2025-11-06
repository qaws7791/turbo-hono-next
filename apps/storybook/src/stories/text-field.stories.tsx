import { Label } from "@repo/ui/form";
import { FormTextField, Input, TextArea, TextField } from "@repo/ui/text-field";
import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

/**
 * TextField components based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation and focus management
 * - ARIA attributes for accessibility
 * - Built-in validation support
 * - Input and TextArea variants
 * - Form integration with labels, descriptions, and errors
 * - Accessible by default
 *
 * Components:
 * - TextField: Base container component
 * - Input: Single-line text input
 * - TextArea: Multi-line text input
 * - FormTextField: Pre-composed form field with label, description, and error
 *
 * @see https://react-spectrum.adobe.com/react-aria/TextField.html
 */
const meta = {
  title: "Components/TextField",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
    isDisabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default input field
 */
export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

/**
 * Disabled input
 */
export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    isDisabled: true,
  },
};

/**
 * Input with value
 */
export const WithValue: Story = {
  args: {
    defaultValue: "Sample text",
  },
};

/**
 * Input field with label
 */
export const WithLabel: Story = {
  render: () => (
    <TextField className="w-[300px]">
      <Label>Email</Label>
      <Input
        type="email"
        placeholder="Enter your email"
      />
    </TextField>
  ),
};

/**
 * Basic TextArea
 */
export const TextAreaBasic: Story = {
  render: () => (
    <TextArea
      placeholder="Enter your message..."
      className="w-[300px]"
    />
  ),
};

/**
 * TextArea with label
 */
export const TextAreaWithLabel: Story = {
  render: () => (
    <TextField className="w-[300px]">
      <Label>Description</Label>
      <TextArea placeholder="Enter description..." />
    </TextField>
  ),
};

/**
 * Form TextField with all features
 */
export const FormTextFieldBasic: Story = {
  render: () => (
    <FormTextField
      label="Username"
      description="Choose a unique username"
      placeholder="Enter username"
      className="w-[300px]"
    />
  ),
};

/**
 * Form TextField with error
 */
export const FormTextFieldWithError: Story = {
  render: () => (
    <FormTextField
      label="Email"
      description="We'll never share your email"
      errorMessage="Please enter a valid email address"
      placeholder="Enter email"
      isInvalid
      className="w-[300px]"
    />
  ),
};

/**
 * Form TextField as TextArea
 */
export const FormTextFieldTextArea: Story = {
  render: () => (
    <FormTextField
      label="Bio"
      description="Tell us about yourself"
      placeholder="Enter your bio..."
      textArea
      className="w-[300px]"
    />
  ),
};

/**
 * Required field
 */
export const Required: Story = {
  render: () => (
    <FormTextField
      label="Full Name"
      description="This field is required"
      placeholder="Enter your full name"
      isRequired
      className="w-[300px]"
    />
  ),
};

/**
 * Different input types
 */
export const InputTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <FormTextField
        label="Text"
        placeholder="Text input"
        type="text"
        className="w-[300px]"
      />
      <FormTextField
        label="Email"
        placeholder="email@example.com"
        type="email"
        className="w-[300px]"
      />
      <FormTextField
        label="Password"
        placeholder="Enter password"
        type="password"
        className="w-[300px]"
      />
      <FormTextField
        label="Number"
        placeholder="Enter number"
        type="number"
        className="w-[300px]"
      />
      <FormTextField
        label="URL"
        placeholder="https://example.com"
        type="url"
        className="w-[300px]"
      />
      <FormTextField
        label="Tel"
        placeholder="+1 (555) 000-0000"
        type="tel"
        className="w-[300px]"
      />
    </div>
  ),
};

/**
 * Controlled input
 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState("");

    return (
      <div className="space-y-4">
        <FormTextField
          label="Controlled Input"
          description="Type something to see it reflected below"
          placeholder="Type here..."
          value={value}
          onChange={setValue}
          className="w-[300px]"
        />
        <div className="w-[300px] rounded-md bg-muted p-4">
          <p className="text-sm font-medium">
            Current value: {value || "(empty)"}
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Character counter example
 */
export const WithCharacterCounter: Story = {
  render: () => {
    const [value, setValue] = React.useState("");
    const maxLength = 100;

    return (
      <div className="space-y-2">
        <TextField className="w-[300px]">
          <Label>Tweet</Label>
          <TextArea
            placeholder="What's happening?"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={maxLength}
          />
        </TextField>
        <div className="flex w-[300px] justify-end">
          <span className="text-sm text-muted-foreground">
            {value.length}/{maxLength}
          </span>
        </div>
      </div>
    );
  },
};

/**
 * Validation example
 */
export const WithValidation: Story = {
  render: () => {
    const [email, setEmail] = React.useState("");
    const [error, setError] = React.useState("");

    const validateEmail = (value: string) => {
      if (!value) {
        setError("Email is required");
        return false;
      }
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        setError("Invalid email address");
        return false;
      }
      setError("");
      return true;
    };

    return (
      <FormTextField
        label="Email"
        description="Enter your email address"
        placeholder="email@example.com"
        type="email"
        value={email}
        onChange={setEmail}
        onBlur={() => validateEmail(email)}
        errorMessage={error}
        isInvalid={!!error}
        className="w-[300px]"
      />
    );
  },
};

/**
 * Login form example
 */
export const LoginForm: Story = {
  render: () => (
    <form className="w-[350px] space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Login</h2>
      <FormTextField
        label="Email"
        placeholder="Enter your email"
        type="email"
        isRequired
      />
      <FormTextField
        label="Password"
        placeholder="Enter your password"
        type="password"
        isRequired
      />
      <button
        type="submit"
        className="h-10 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Sign In
      </button>
    </form>
  ),
};

/**
 * Contact form example
 */
export const ContactForm: Story = {
  render: () => (
    <form className="w-[400px] space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Contact Us</h2>
      <FormTextField
        label="Name"
        placeholder="Your name"
        isRequired
      />
      <FormTextField
        label="Email"
        placeholder="your@email.com"
        type="email"
        isRequired
      />
      <FormTextField
        label="Subject"
        placeholder="What is this about?"
        isRequired
      />
      <FormTextField
        label="Message"
        placeholder="Your message..."
        textArea
        isRequired
      />
      <button
        type="submit"
        className="h-10 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Send Message
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
      <FormTextField
        label="Normal"
        placeholder="Normal state"
        className="w-[300px]"
      />
      <FormTextField
        label="Disabled"
        placeholder="Disabled state"
        isDisabled
        className="w-[300px]"
      />
      <FormTextField
        label="Required"
        placeholder="Required field"
        isRequired
        className="w-[300px]"
      />
      <FormTextField
        label="With Error"
        placeholder="Error state"
        errorMessage="This field has an error"
        isInvalid
        className="w-[300px]"
      />
      <FormTextField
        label="With Value"
        defaultValue="Sample text"
        className="w-[300px]"
      />
    </div>
  ),
};
