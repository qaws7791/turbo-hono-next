import LoadingSpinner from "@repo/ui/loading-spinner";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * LoadingSpinner component for indicating loading states
 *
 * Features:
 * - Simple, animated spinner
 * - Minimal and clean design
 * - Can be used inline or as a page loader
 *
 * Common use cases:
 * - Page loading states
 * - Button loading states
 * - Data fetching indicators
 * - Form submission feedback
 */
const meta = {
  title: "Components/LoadingSpinner",
  component: LoadingSpinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default loading spinner
 */
export const Default: Story = {};

/**
 * In a card context
 */
export const InCard: Story = {
  render: () => (
    <div className="w-[300px] rounded-lg border p-8">
      <LoadingSpinner />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Loading content...
      </p>
    </div>
  ),
};

/**
 * With custom text
 */
export const WithText: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner />
      <p className="text-sm font-medium">Loading...</p>
    </div>
  ),
};

/**
 * Multiple spinners with different sizes
 */
export const DifferentSizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>
        <span className="text-xs">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner />
        <span className="text-xs">Default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>
        <span className="text-xs">Large</span>
      </div>
    </div>
  ),
};

/**
 * Full page loading
 */
export const FullPage: Story = {
  render: () => (
    <div className="flex h-[400px] w-[600px] items-center justify-center rounded-lg border bg-muted/30">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner />
        <p className="text-sm font-medium">Loading page...</p>
      </div>
    </div>
  ),
};

/**
 * In button context
 */
export const InButton: Story = {
  render: () => (
    <button
      disabled
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-50"
    >
      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
      Loading...
    </button>
  ),
};

/**
 * Data loading states
 */
export const DataLoading: Story = {
  render: () => (
    <div className="w-[400px] space-y-4 rounded-lg border p-6">
      <h3 className="text-lg font-semibold">User Profile</h3>
      <div className="flex flex-col items-center gap-4 py-8">
        <LoadingSpinner />
        <p className="text-sm text-muted-foreground">Fetching user data...</p>
      </div>
    </div>
  ),
};

/**
 * Overlay loading
 */
export const OverlayLoading: Story = {
  render: () => (
    <div className="relative h-[300px] w-[400px] rounded-lg border">
      <div className="p-6">
        <h3 className="mb-2 text-lg font-semibold">Content</h3>
        <p className="text-sm text-muted-foreground">
          Some content that is being loaded...
        </p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <LoadingSpinner />
      </div>
    </div>
  ),
};
