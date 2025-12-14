import { AspectRatio } from "@repo/ui/aspect-ratio";

import type { Meta, StoryObj } from "@storybook/react-vite";


const meta = {
  title: "Components/AspectRatio",
  component: AspectRatio,
  tags: ["autodocs"],
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AspectRatio
      ratio={16 / 9}
      className="bg-muted w-full max-w-2xl"
    >
      <img
        src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80"
        alt="Forest landscape"
        className="h-full w-full rounded-lg object-cover"
      />
    </AspectRatio>
  ),
};
