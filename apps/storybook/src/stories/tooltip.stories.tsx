import { Button } from "@repo/ui/button";
import { Tooltip, TooltipTrigger } from "@repo/ui/tooltip";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Tooltip component based on React Aria Components
 *
 * Features:
 * - ARIA attributes for accessibility
 * - Keyboard support (ESC to close)
 * - Multiple placement options
 * - Smooth enter/exit animations
 * - Automatic positioning
 * - Shows on hover or focus
 *
 * Common use cases:
 * - Icon button labels
 * - Additional information
 * - Help text
 * - Feature descriptions
 * - Truncated text expansion
 *
 * @see https://react-spectrum.adobe.com/react-aria/Tooltip.html
 */
const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default tooltip on button
 */
export const Default: Story = {
  render: () => (
    <TooltipTrigger>
      <Button>Hover me</Button>
      <Tooltip>This is a tooltip</Tooltip>
    </TooltipTrigger>
  ),
};

/**
 * Tooltip on icon button
 */
export const OnIconButton: Story = {
  render: () => (
    <TooltipTrigger>
      <Button
        isIconOnly
        variant="outline"
      >
        ⚙
      </Button>
      <Tooltip>Settings</Tooltip>
    </TooltipTrigger>
  ),
};

/**
 * Tooltip placements
 */
export const Placements: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-8">
      <TooltipTrigger>
        <Button variant="outline">Top</Button>
        <Tooltip placement="top">Tooltip on top</Tooltip>
      </TooltipTrigger>
      <div className="flex gap-8">
        <TooltipTrigger>
          <Button variant="outline">Left</Button>
          <Tooltip placement="left">Tooltip on left</Tooltip>
        </TooltipTrigger>
        <TooltipTrigger>
          <Button variant="outline">Right</Button>
          <Tooltip placement="right">Tooltip on right</Tooltip>
        </TooltipTrigger>
      </div>
      <TooltipTrigger>
        <Button variant="outline">Bottom</Button>
        <Tooltip placement="bottom">Tooltip on bottom</Tooltip>
      </TooltipTrigger>
    </div>
  ),
};

/**
 * Tooltip with long text
 */
export const LongText: Story = {
  render: () => (
    <TooltipTrigger>
      <Button variant="outline">Hover for details</Button>
      <Tooltip className="max-w-xs">
        This is a longer tooltip message that provides more detailed information
        about the feature or action. It can wrap to multiple lines.
      </Tooltip>
    </TooltipTrigger>
  ),
};

/**
 * Multiple tooltips
 */
export const MultipleTooltips: Story = {
  render: () => (
    <div className="flex gap-4">
      <TooltipTrigger>
        <Button
          isIconOnly
          variant="outline"
        >
          ✏
        </Button>
        <Tooltip>Edit</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <Button
          isIconOnly
          variant="outline"
        >
          🗑
        </Button>
        <Tooltip>Delete</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <Button
          isIconOnly
          variant="outline"
        >
          ↓
        </Button>
        <Tooltip>Download</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <Button
          isIconOnly
          variant="outline"
        >
          ⋮
        </Button>
        <Tooltip>More options</Tooltip>
      </TooltipTrigger>
    </div>
  ),
};

/**
 * Tooltips on text elements
 */
export const OnTextElements: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <TooltipTrigger>
          <span className="cursor-help underline decoration-dotted">
            Hover for definition
          </span>
          <Tooltip>This is the definition or explanation of the term.</Tooltip>
        </TooltipTrigger>
      </div>
      <div className="w-[200px]">
        <TooltipTrigger>
          <p className="cursor-help truncate">
            This is a very long text that will be truncated
          </p>
          <Tooltip>This is a very long text that will be truncated</Tooltip>
        </TooltipTrigger>
      </div>
    </div>
  ),
};

/**
 * Toolbar with tooltips
 */
export const Toolbar: Story = {
  render: () => (
    <div className="flex gap-2 rounded-lg border p-2">
      <TooltipTrigger>
        <Button
          isIconOnly
          variant="ghost"
        >
          <strong>B</strong>
        </Button>
        <Tooltip>Bold</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <Button
          isIconOnly
          variant="ghost"
        >
          <em>I</em>
        </Button>
        <Tooltip>Italic</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <Button
          isIconOnly
          variant="ghost"
        >
          <u>U</u>
        </Button>
        <Tooltip>Underline</Tooltip>
      </TooltipTrigger>
      <div className="mx-1 w-px bg-border" />
      <TooltipTrigger>
        <Button
          isIconOnly
          variant="ghost"
        >
          ☰
        </Button>
        <Tooltip>Align Left</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <Button
          isIconOnly
          variant="ghost"
        >
          ≡
        </Button>
        <Tooltip>Align Center</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <Button
          isIconOnly
          variant="ghost"
        >
          ☰
        </Button>
        <Tooltip>Align Right</Tooltip>
      </TooltipTrigger>
    </div>
  ),
};

/**
 * Status indicators with tooltips
 */
export const StatusIndicators: Story = {
  render: () => (
    <div className="flex gap-4">
      <TooltipTrigger>
        <div className="flex h-10 w-10 cursor-help items-center justify-center rounded-full bg-green-500 text-white">
          ✓
        </div>
        <Tooltip>Active and running normally</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <div className="flex h-10 w-10 cursor-help items-center justify-center rounded-full bg-yellow-500 text-white">
          !
        </div>
        <Tooltip>Warning: Requires attention</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <div className="flex h-10 w-10 cursor-help items-center justify-center rounded-full bg-red-500 text-white">
          ✗
        </div>
        <Tooltip>Error: Service unavailable</Tooltip>
      </TooltipTrigger>
    </div>
  ),
};

/**
 * Form field help tooltips
 */
export const FormFieldHelp: Story = {
  render: () => (
    <div className="w-[350px] space-y-4 rounded-lg border p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Username</label>
          <TooltipTrigger>
            <span className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-muted text-xs">
              ?
            </span>
            <Tooltip className="max-w-xs">
              Your username must be 3-20 characters long and can only contain
              letters, numbers, and underscores.
            </Tooltip>
          </TooltipTrigger>
        </div>
        <input
          type="text"
          placeholder="Enter username"
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Password</label>
          <TooltipTrigger>
            <span className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-muted text-xs">
              ?
            </span>
            <Tooltip className="max-w-xs">
              Password must be at least 8 characters and include uppercase,
              lowercase, number, and special character.
            </Tooltip>
          </TooltipTrigger>
        </div>
        <input
          type="password"
          placeholder="Enter password"
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    </div>
  ),
};

/**
 * Data table with tooltips
 */
export const DataTable: Story = {
  render: () => (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-3 text-left text-sm font-medium">Name</th>
            <th className="p-3 text-left text-sm font-medium">Status</th>
            <th className="p-3 text-right text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="p-3 text-sm">John Doe</td>
            <td className="p-3 text-sm">
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                Active
              </span>
            </td>
            <td className="p-3 text-right">
              <div className="flex justify-end gap-1">
                <TooltipTrigger>
                  <Button
                    isIconOnly
                    variant="ghost"
                  >
                    ✏
                  </Button>
                  <Tooltip>Edit user</Tooltip>
                </TooltipTrigger>
                <TooltipTrigger>
                  <Button
                    isIconOnly
                    variant="ghost"
                  >
                    🗑
                  </Button>
                  <Tooltip>Delete user</Tooltip>
                </TooltipTrigger>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
};

/**
 * Keyboard shortcuts in tooltips
 */
export const KeyboardShortcuts: Story = {
  render: () => (
    <div className="flex gap-2 rounded-lg border p-2">
      <TooltipTrigger>
        <Button
          isIconOnly
          variant="ghost"
        >
          💾
        </Button>
        <Tooltip>
          Save <kbd className="ml-1 rounded border px-1 text-xs">Ctrl+S</kbd>
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <Button
          isIconOnly
          variant="ghost"
        >
          📋
        </Button>
        <Tooltip>
          Copy <kbd className="ml-1 rounded border px-1 text-xs">Ctrl+C</kbd>
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <Button
          isIconOnly
          variant="ghost"
        >
          📄
        </Button>
        <Tooltip>
          Paste <kbd className="ml-1 rounded border px-1 text-xs">Ctrl+V</kbd>
        </Tooltip>
      </TooltipTrigger>
    </div>
  ),
};
