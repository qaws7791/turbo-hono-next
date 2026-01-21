import { Kbd, KbdGroup } from "@repo/ui/kbd";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Kbd",
  component: Kbd,
  tags: ["autodocs"],
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
        <span className="text-muted-foreground text-sm">Open search</span>
      </div>
      <KbdGroup>
        <Kbd>Shift</Kbd>
        <Kbd>Alt</Kbd>
        <Kbd>P</Kbd>
      </KbdGroup>
    </div>
  ),
};
