import { Button } from "@repo/ui/button";
import { Toaster } from "@repo/ui/sonner";
import { toast } from "sonner";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Sonner",
  component: Toaster,
  tags: ["autodocs"],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <Button
        variant="outline"
        onClick={() =>
          toast("Event has been created", {
            description: "Sunday, December 03, 2023 at 9:00 AM",
            action: {
              label: "Undo",
              onClick: () => {},
            },
          })
        }
      >
        Show toast
      </Button>
      <Toaster />
    </div>
  ),
};
