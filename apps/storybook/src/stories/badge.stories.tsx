import { Badge } from "@repo/ui/badge";
import { BadgeCheck, Check } from "lucide-react";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap gap-2">
        <Badge>Badge</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge className="bg-blue-500 text-white dark:bg-blue-600">
          <BadgeCheck />
          Verified
        </Badge>
        <Badge className="h-5 min-w-5 rounded-full px-1 font-mono">
          <Check className="size-3" />
        </Badge>
        <Badge
          className="h-5 min-w-5 rounded-full px-1 font-mono"
          variant="destructive"
        >
          99
        </Badge>
      </div>
    </div>
  ),
};
