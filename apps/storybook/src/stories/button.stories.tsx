import { Button } from "@repo/ui/button";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Button component based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation support (Space/Enter to activate)
 * - ARIA attributes built-in for accessibility
 * - Multiple variants and sizes
 * - Hover, focus, and pressed states
 * - Accessible by default
 *
 * @see https://react-spectrum.adobe.com/react-aria/Button.html
 */
const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default button with primary variant
 */
export const Default: Story = {
  args: {
    children: "Button",
  },
};

/**
 * Primary button - main call-to-action
 */
export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary",
  },
};

/**
 * Secondary button - supporting actions
 */
export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

/**
 * Outline button - less prominent actions
 */
export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

/**
 * Destructive button - dangerous or irreversible actions
 */
export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive",
  },
};

/**
 * Ghost button - minimal styling
 */
export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
};

/**
 * Link button - appears as a text link
 */
export const Link: Story = {
  args: {
    variant: "link",
    children: "Link",
  },
};

/**
 * Small button
 */
export const Small: Story = {
  args: {
    size: "sm",
    children: "Small",
  },
};

/**
 * Medium button (default)
 */
export const Medium: Story = {
  args: {
    size: "md",
    children: "Medium",
  },
};

/**
 * Large button
 */
export const Large: Story = {
  args: {
    size: "lg",
    children: "Large",
  },
};

/**
 * Icon only button - square shape for icons
 */
export const IconOnly: Story = {
  args: {
    isIconOnly: true,
    children: "🔍",
  },
};

/**
 * Disabled button state
 */
export const Disabled: Story = {
  args: {
    isDisabled: true,
    children: "Disabled",
  },
};

/**
 * All variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

/**
 * All sizes showcase
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button isIconOnly>🔍</Button>
    </div>
  ),
};

/**
 * Disabled state across variants
 */
export const DisabledVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button
        variant="primary"
        isDisabled
      >
        Primary
      </Button>
      <Button
        variant="secondary"
        isDisabled
      >
        Secondary
      </Button>
      <Button
        variant="outline"
        isDisabled
      >
        Outline
      </Button>
      <Button
        variant="destructive"
        isDisabled
      >
        Destructive
      </Button>
      <Button
        variant="ghost"
        isDisabled
      >
        Ghost
      </Button>
      <Button
        variant="link"
        isDisabled
      >
        Link
      </Button>
    </div>
  ),
};

/**
 * Loading state - shows spinner and disables button
 */
export const Loading: Story = {
  args: {
    isLoading: true,
    children: "Submit",
  },
};

/**
 * Loading state with custom fallback
 */
export const LoadingWithFallback: Story = {
  args: {
    isLoading: true,
    loadingFallback: "Loading...",
    children: "Submit",
  },
};

/**
 * Loading state across variants
 */
export const LoadingVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button
        isLoading
        variant="primary"
      >
        Primary
      </Button>
      <Button
        isLoading
        variant="secondary"
      >
        Secondary
      </Button>
      <Button
        isLoading
        variant="outline"
      >
        Outline
      </Button>
    </div>
  ),
};

/**
 * Full width button
 */
export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: "Full Width Button",
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

/**
 * Icon only with different sizes
 */
export const IconOnlySizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button
        isIconOnly
        size="sm"
      >
        🔍
      </Button>
      <Button
        isIconOnly
        size="md"
      >
        🔍
      </Button>
      <Button
        isIconOnly
        size="lg"
      >
        🔍
      </Button>
    </div>
  ),
};

/**
 * Button with event handling
 */
export const WithEventHandling: Story = {
  render: () => (
    <Button onPress={() => alert("Button pressed!")}>Click me</Button>
  ),
};

/**
 * Buttons in a form layout
 */
export const FormActions: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button
        type="submit"
        variant="primary"
      >
        Submit
      </Button>
      <Button
        type="reset"
        variant="outline"
      >
        Reset
      </Button>
      <Button
        type="button"
        variant="ghost"
      >
        Cancel
      </Button>
    </div>
  ),
};
