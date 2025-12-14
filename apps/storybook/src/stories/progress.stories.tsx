import { Progress } from "@repo/ui/progress";
import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Progress",
  component: Progress,
  tags: ["autodocs"],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [progress, setProgress] = React.useState(13);

    React.useEffect(() => {
      const timer = setTimeout(() => setProgress(66), 500);
      return () => clearTimeout(timer);
    }, []);

    return (
      <Progress
        value={progress}
        className="w-[60%]"
      />
    );
  },
};
