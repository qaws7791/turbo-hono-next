import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@repo/ui/ai/reasoning";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "AI Elements/Reasoning",
  component: Reasoning,
  tags: ["autodocs"],
} satisfies Meta<typeof Reasoning>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Reasoning defaultOpen>
      <ReasoningTrigger />
      <ReasoningContent>
        The assistant analyzed prior tasks, grouped them by scope, and selected
        the shortest path that covers TypeScript fundamentals before moving to
        generics and tooling.
      </ReasoningContent>
    </Reasoning>
  ),
};

export const Streaming: Story = {
  render: () => (
    <Reasoning
      defaultOpen
      isStreaming
    >
      <ReasoningTrigger />
      <ReasoningContent>
        Streaming the reasoning steps as they are generated...
      </ReasoningContent>
    </Reasoning>
  ),
};
