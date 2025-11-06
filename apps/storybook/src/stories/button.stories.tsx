import { Button } from "@repo/ui/button";

import type { Meta, StoryObj } from "@storybook/react";

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
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "outline",
        "destructive",
        "ghost",
        "link",
      ],
      description: "Visual style variant of the button",
      table: {
        defaultValue: { summary: "primary" },
      },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "icon"],
      description: "Size of the button",
      table: {
        defaultValue: { summary: "md" },
      },
    },
    isDisabled: {
      control: "boolean",
      description: "Whether the button is disabled",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    children: {
      control: "text",
      description: "Content to render inside the button",
    },
  },
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
 * Icon button - square shape for icons
 */
export const Icon: Story = {
  args: {
    size: "icon",
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
      <Button size="icon">🔍</Button>
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
 * Button with loading state pattern
 */
export const WithLoadingState: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button>
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
        Loading...
      </Button>
      <Button
        variant="secondary"
        isDisabled
      >
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
        Loading...
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
