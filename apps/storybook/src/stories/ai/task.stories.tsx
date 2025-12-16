import {
  Task,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskTrigger,
} from "@repo/ui/ai/task";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "AI Elements/Task",
  component: Task,
  tags: ["autodocs"],
} satisfies Meta<typeof Task>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Task defaultOpen>
      <TaskTrigger title="Review onboarding materials" />
      <TaskContent>
        <TaskItem>
          Confirm the environment setup instructions are current.
        </TaskItem>
        <TaskItem>Update the checklist for week 1 tasks.</TaskItem>
        <TaskItem>
          Related files:
          <div className="mt-2 flex flex-wrap gap-2">
            <TaskItemFile>README.md</TaskItemFile>
            <TaskItemFile>docs/ai-tutor-chat.md</TaskItemFile>
          </div>
        </TaskItem>
      </TaskContent>
    </Task>
  ),
};
