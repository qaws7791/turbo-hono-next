import { Button } from "@repo/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Card component for displaying grouped content
 *
 * Features:
 * - Compound component pattern for flexible composition
 * - Consistent border and spacing
 * - Supports header, content, footer, and action areas
 * - Responsive and accessible
 *
 * Sub-components:
 * - CardHeader: Container for title, description, and actions
 * - CardTitle: Main heading
 * - CardDescription: Supporting text
 * - CardAction: Action buttons or icons in header
 * - CardContent: Main content area
 * - CardFooter: Bottom section for actions or metadata
 *
 * Common use cases:
 * - Feature cards
 * - Product listings
 * - Dashboard widgets
 * - Form containers
 */
const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  subcomponents: {
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
    CardFooter,
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default card with minimal content
 */
export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent>
        <p>Card content goes here.</p>
      </CardContent>
    </Card>
  ),
};

/**
 * Card with header
 */
export const WithHeader: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description text</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content area of the card.</p>
      </CardContent>
    </Card>
  ),
};

/**
 * Card with header and footer
 */
export const WithHeaderAndFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description text</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content area of the card.</p>
      </CardContent>
      <CardFooter>
        <Button variant="primary">Action</Button>
        <Button variant="outline">Cancel</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * Card with action in header
 */
export const WithHeaderAction: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages</CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
          >
            Mark all read
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>Message 1: New comment on your post</p>
          <p>Message 2: You have a new follower</p>
          <p>Message 3: Your post was liked</p>
        </div>
      </CardContent>
    </Card>
  ),
};

/**
 * Feature card example
 */
export const FeatureCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Advanced Analytics</CardTitle>
        <CardDescription>
          Get detailed insights into your application performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          <li>✓ Real-time monitoring</li>
          <li>✓ Custom dashboards</li>
          <li>✓ Data export</li>
          <li>✓ Team collaboration</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          variant="primary"
          className="w-full"
        >
          Learn More
        </Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * Product card example
 */
export const ProductCard: Story = {
  render: () => (
    <Card className="w-[300px]">
      <div className="h-[200px] w-full bg-muted" />
      <CardHeader>
        <CardTitle>Product Name</CardTitle>
        <CardDescription>Brief product description</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">$99.99</span>
          <span className="text-sm text-muted-foreground">In Stock</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="primary"
          className="w-full"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * Dashboard widget card
 */
export const DashboardWidget: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Total Revenue</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="icon"
          >
            ⋮
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">$45,231.89</div>
        <p className="text-sm text-muted-foreground">+20.1% from last month</p>
      </CardContent>
    </Card>
  ),
};

/**
 * Form container card
 */
export const FormCard: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium"
            >
              Name
            </label>
            <input
              id="name"
              placeholder="Enter your name"
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
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
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="primary"
          className="w-full"
        >
          Create Account
        </Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * Card grid layout
 */
export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Card className="w-[250px]">
        <CardHeader>
          <CardTitle>Card 1</CardTitle>
          <CardDescription>First card</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for card 1</p>
        </CardContent>
      </Card>
      <Card className="w-[250px]">
        <CardHeader>
          <CardTitle>Card 2</CardTitle>
          <CardDescription>Second card</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for card 2</p>
        </CardContent>
      </Card>
      <Card className="w-[250px]">
        <CardHeader>
          <CardTitle>Card 3</CardTitle>
          <CardDescription>Third card</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for card 3</p>
        </CardContent>
      </Card>
      <Card className="w-[250px]">
        <CardHeader>
          <CardTitle>Card 4</CardTitle>
          <CardDescription>Fourth card</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for card 4</p>
        </CardContent>
      </Card>
    </div>
  ),
};

/**
 * Card with complex content
 */
export const ComplexContent: Story = {
  render: () => (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>Project Status</CardTitle>
        <CardDescription>Overview of current tasks</CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
          >
            View All
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">Design</span>
                <span className="text-sm text-muted-foreground">75%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 w-3/4 rounded-full bg-primary" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">Development</span>
                <span className="text-sm text-muted-foreground">45%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 w-[45%] rounded-full bg-primary" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">Testing</span>
                <span className="text-sm text-muted-foreground">20%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 w-1/5 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Last updated 2 hours ago
        </p>
      </CardFooter>
    </Card>
  ),
};
