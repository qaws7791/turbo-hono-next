import { Loader } from "@repo/ui/ai/loader";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "AI Elements/Loader",
  component: Loader,
  tags: ["autodocs"],
  args: {
    size: 20,
  },
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader {...args} />
      Generating response...
    </div>
  ),
};
