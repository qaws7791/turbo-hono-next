import { Button } from "@repo/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/ui/empty";
import { Inbox } from "lucide-react";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Empty",
  component: Empty,
  tags: ["autodocs"],
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Empty className="max-w-xl">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox />
        </EmptyMedia>
        <EmptyTitle>No messages yet</EmptyTitle>
        <EmptyDescription>
          When you receive new messages, they will show up here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Compose message</Button>
      </EmptyContent>
    </Empty>
  ),
};
