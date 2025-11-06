import { Button } from "@repo/ui/button";
import { Popover, PopoverDialog, PopoverTrigger } from "@repo/ui/popover";

import type { Meta, StoryObj } from "@storybook/react";

/**
 * Popover component based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation (ESC to close)
 * - ARIA attributes for accessibility
 * - Multiple placement options
 * - Smooth animations
 * - Auto-positioning
 * - Accessible by default
 *
 * Common use cases:
 * - Context menus
 * - Additional information panels
 * - Action menus
 * - Form help text
 * - Quick settings
 *
 * @see https://react-spectrum.adobe.com/react-aria/Popover.html
 */
const meta = {
  title: "Components/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default popover
 */
export const Default: Story = {
  render: () => (
    <PopoverTrigger>
      <Button>Open Popover</Button>
      <Popover>
        <PopoverDialog>
          <div className="space-y-2">
            <h3 className="font-semibold">Popover Title</h3>
            <p className="text-sm text-muted-foreground">
              This is a popover with some content.
            </p>
          </div>
        </PopoverDialog>
      </Popover>
    </PopoverTrigger>
  ),
};

/**
 * Different placements
 */
export const Placements: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-8">
      <PopoverTrigger>
        <Button variant="outline">Top</Button>
        <Popover placement="top">
          <PopoverDialog>
            <p className="text-sm">Popover on top</p>
          </PopoverDialog>
        </Popover>
      </PopoverTrigger>
      <div className="flex gap-8">
        <PopoverTrigger>
          <Button variant="outline">Left</Button>
          <Popover placement="left">
            <PopoverDialog>
              <p className="text-sm">Popover on left</p>
            </PopoverDialog>
          </Popover>
        </PopoverTrigger>
        <PopoverTrigger>
          <Button variant="outline">Right</Button>
          <Popover placement="right">
            <PopoverDialog>
              <p className="text-sm">Popover on right</p>
            </PopoverDialog>
          </Popover>
        </PopoverTrigger>
      </div>
      <PopoverTrigger>
        <Button variant="outline">Bottom</Button>
        <Popover placement="bottom">
          <PopoverDialog>
            <p className="text-sm">Popover on bottom</p>
          </PopoverDialog>
        </Popover>
      </PopoverTrigger>
    </div>
  ),
};

/**
 * With rich content
 */
export const RichContent: Story = {
  render: () => (
    <PopoverTrigger>
      <Button>View Profile</Button>
      <Popover className="w-[300px]">
        <PopoverDialog>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                JD
              </div>
              <div>
                <h4 className="font-semibold">John Doe</h4>
                <p className="text-sm text-muted-foreground">
                  john@example.com
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium">Admin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
            <Button
              className="w-full"
              size="sm"
            >
              View Full Profile
            </Button>
          </div>
        </PopoverDialog>
      </Popover>
    </PopoverTrigger>
  ),
};

/**
 * Action menu
 */
export const ActionMenu: Story = {
  render: () => (
    <PopoverTrigger>
      <Button
        variant="outline"
        size="icon"
      >
        ⋮
      </Button>
      <Popover className="w-[200px]">
        <PopoverDialog>
          <div className="space-y-1">
            <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent">
              ✏ Edit
            </button>
            <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent">
              📋 Copy
            </button>
            <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent">
              🗑 Delete
            </button>
          </div>
        </PopoverDialog>
      </Popover>
    </PopoverTrigger>
  ),
};

/**
 * Form help popover
 */
export const FormHelp: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Password</label>
        <PopoverTrigger>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
          >
            ?
          </Button>
          <Popover className="w-[250px]">
            <PopoverDialog>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Password Requirements</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• At least 8 characters</li>
                  <li>• Include uppercase letter</li>
                  <li>• Include lowercase letter</li>
                  <li>• Include number</li>
                  <li>• Include special character</li>
                </ul>
              </div>
            </PopoverDialog>
          </Popover>
        </PopoverTrigger>
      </div>
      <input
        type="password"
        placeholder="Enter password"
        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
    </div>
  ),
};

/**
 * Settings popover
 */
export const Settings: Story = {
  render: () => (
    <PopoverTrigger>
      <Button variant="outline">⚙ Settings</Button>
      <Popover className="w-[300px]">
        <PopoverDialog>
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Notifications</span>
                <input
                  type="checkbox"
                  defaultChecked
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-save</span>
                <input type="checkbox" />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Theme</label>
                <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>
            </div>
          </div>
        </PopoverDialog>
      </Popover>
    </PopoverTrigger>
  ),
};

/**
 * Share popover
 */
export const Share: Story = {
  render: () => (
    <PopoverTrigger>
      <Button>Share</Button>
      <Popover className="w-[350px]">
        <PopoverDialog>
          <div className="space-y-4">
            <h3 className="font-semibold">Share this page</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
              >
                📧
              </Button>
              <Button
                variant="outline"
                size="icon"
              >
                🐦
              </Button>
              <Button
                variant="outline"
                size="icon"
              >
                👥
              </Button>
              <Button
                variant="outline"
                size="icon"
              >
                💼
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://example.com/page"
                  className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                />
                <Button size="sm">Copy</Button>
              </div>
            </div>
          </div>
        </PopoverDialog>
      </Popover>
    </PopoverTrigger>
  ),
};

/**
 * Date range filter
 */
export const DateFilter: Story = {
  render: () => (
    <PopoverTrigger>
      <Button variant="outline">📅 Filter by Date</Button>
      <Popover className="w-[300px]">
        <PopoverDialog>
          <div className="space-y-4">
            <h3 className="font-semibold">Select Date Range</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">From</label>
                <input
                  type="date"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <input
                  type="date"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
              <Button size="sm">Apply</Button>
            </div>
          </div>
        </PopoverDialog>
      </Popover>
    </PopoverTrigger>
  ),
};
