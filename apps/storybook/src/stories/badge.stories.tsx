import { Badge } from "@repo/ui/badge";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Badge component for displaying labels, tags, or status indicators
 *
 * Features:
 * - Multiple color variants for different contexts
 * - Compact, rounded design
 * - Suitable for inline or standalone use
 * - Can contain text, icons, or both
 *
 * Common use cases:
 * - Status indicators (Active, Pending, Completed)
 * - Category tags
 * - Notification counts
 * - Feature flags
 */
const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "destructive", "outline"],
      description: "Visual style variant of the badge",
      table: {
        defaultValue: { summary: "primary" },
      },
    },
    children: {
      control: "text",
      description: "Content to display inside the badge",
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default badge with primary variant
 */
export const Default: Story = {
  args: {
    children: "Badge",
  },
};

/**
 * Primary badge - main emphasis
 */
export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary",
  },
};

/**
 * Secondary badge - secondary information
 */
export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

/**
 * Destructive badge - errors or warnings
 */
export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive",
  },
};

/**
 * Outline badge - subtle emphasis
 */
export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

/**
 * All variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

/**
 * Status indicators - common use case
 */
export const StatusIndicators: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="primary">Active</Badge>
      <Badge variant="secondary">Pending</Badge>
      <Badge variant="destructive">Failed</Badge>
      <Badge variant="outline">Inactive</Badge>
    </div>
  ),
};

/**
 * With emoji or special characters
 */
export const WithEmoji: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="primary">✓ Verified</Badge>
      <Badge variant="secondary">★ Featured</Badge>
      <Badge variant="destructive">✗ Error</Badge>
      <Badge variant="outline">⚠ Warning</Badge>
    </div>
  ),
};

/**
 * Notification counts
 */
export const NotificationCounts: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative inline-block">
        <span className="text-sm">Messages</span>
        <Badge
          variant="destructive"
          className="absolute -right-8 -top-2"
        >
          3
        </Badge>
      </div>
      <div className="relative inline-block">
        <span className="text-sm">Notifications</span>
        <Badge
          variant="primary"
          className="absolute -right-8 -top-2"
        >
          12
        </Badge>
      </div>
      <div className="relative inline-block">
        <span className="text-sm">Updates</span>
        <Badge
          variant="secondary"
          className="absolute -right-8 -top-2"
        >
          99+
        </Badge>
      </div>
    </div>
  ),
};

/**
 * Category tags
 */
export const CategoryTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">JavaScript</Badge>
      <Badge variant="outline">React</Badge>
      <Badge variant="outline">TypeScript</Badge>
      <Badge variant="outline">Tailwind CSS</Badge>
      <Badge variant="outline">Storybook</Badge>
    </div>
  ),
};

/**
 * Different text lengths
 */
export const DifferentLengths: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="primary">1</Badge>
      <Badge variant="primary">New</Badge>
      <Badge variant="primary">In Progress</Badge>
      <Badge variant="primary">Very Long Badge Text Example</Badge>
    </div>
  ),
};

/**
 * Badges in context - with other elements
 */
export const InContext: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Project Name</h3>
        <Badge variant="primary">Active</Badge>
      </div>
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Feature Request</h3>
        <Badge variant="secondary">Pending Review</Badge>
      </div>
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Bug Report</h3>
        <Badge variant="destructive">Critical</Badge>
      </div>
    </div>
  ),
};

/**
 * Multiple badges together
 */
export const MultipleBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">User Profile</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary">Premium</Badge>
          <Badge variant="secondary">Verified</Badge>
          <Badge variant="outline">Early Adopter</Badge>
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Article Tags</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Tutorial</Badge>
          <Badge variant="outline">JavaScript</Badge>
          <Badge variant="outline">Advanced</Badge>
          <Badge variant="outline">2024</Badge>
        </div>
      </div>
    </div>
  ),
};
