import { Shimmer } from "@repo/ui/ai/shimmer";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "AI Elements/Shimmer",
  component: Shimmer,
  tags: ["autodocs"],
  args: {
    children: "Generating response...",
    duration: 2,
  },
} satisfies Meta<typeof Shimmer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Shimmer {...args} />,
};
