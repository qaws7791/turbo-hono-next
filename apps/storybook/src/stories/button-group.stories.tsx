import { Button } from "@repo/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@repo/ui/button-group";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ButtonGroup>
        <Button variant="outline">Archive</Button>
        <Button variant="outline">Report</Button>
        <Button variant="outline">Snooze</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Previous</Button>
        <ButtonGroupSeparator />
        <Button variant="outline">Next</Button>
      </ButtonGroup>
    </div>
  ),
};
