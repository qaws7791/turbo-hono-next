import { Image } from "@repo/ui/ai/image";

import type { Meta, StoryObj } from "@storybook/react-vite";

const sampleImage = {
  mediaType: "image/png",
  base64:
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=",
};

const meta = {
  title: "AI Elements/Image",
  component: Image,
  tags: ["autodocs"],
  args: {
    alt: "Generated preview",
  },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Image
      {...sampleImage}
      {...args}
      className="h-32 w-32 rounded-md border"
    />
  ),
};
