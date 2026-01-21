import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@repo/ui/ai/tool";

import type { ToolUIPart } from "ai";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "AI Elements/Tool",
  component: Tool,
  tags: ["autodocs"],
} satisfies Meta<typeof Tool>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleInput: ToolUIPart["input"] = {
  userId: "user_123",
  topic: "TypeScript",
  durationWeeks: 4,
};

const sampleOutput: ToolUIPart["output"] = {
  status: "created",
  planId: "plan_456",
  modules: 6,
};

export const Default: Story = {
  render: () => (
    <Tool defaultOpen>
      <ToolHeader
        state="output-available"
        type="tool-createPlan"
      />
      <ToolContent>
        <ToolInput input={sampleInput} />
        <ToolOutput
          errorText={undefined}
          output={sampleOutput}
        />
      </ToolContent>
    </Tool>
  ),
};
