import {
  Plan,
  PlanAction,
  PlanContent,
  PlanDescription,
  PlanFooter,
  PlanHeader,
  PlanTitle,
  PlanTrigger,
} from "@repo/ui/ai/plan";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "AI Elements/Plan",
  component: Plan,
  tags: ["autodocs"],
} satisfies Meta<typeof Plan>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Plan defaultOpen>
      <PlanHeader>
        <div>
          <PlanTitle>TypeScript onboarding</PlanTitle>
          <PlanDescription>
            Four-week plan focused on types, tooling, and practice.
          </PlanDescription>
        </div>
        <PlanAction>
          <PlanTrigger />
        </PlanAction>
      </PlanHeader>
      <PlanContent>
        <ol className="list-inside list-decimal space-y-2 text-sm">
          <li>Examine basic types, unions, and narrowing.</li>
          <li>Practice with generics and utility types.</li>
          <li>Configure tsconfig and linting rules.</li>
          <li>Build a small CLI with tests.</li>
        </ol>
      </PlanContent>
      <PlanFooter className="text-muted-foreground text-xs">
        Last updated 2 hours ago
      </PlanFooter>
    </Plan>
  ),
};

export const Streaming: Story = {
  render: () => (
    <Plan
      defaultOpen
      isStreaming
    >
      <PlanHeader>
        <div>
          <PlanTitle>Generating roadmap</PlanTitle>
          <PlanDescription>Drafting the plan details.</PlanDescription>
        </div>
        <PlanAction>
          <PlanTrigger />
        </PlanAction>
      </PlanHeader>
      <PlanContent>
        <div className="space-y-2 text-sm">
          <p>Collecting priorities...</p>
          <p>Sequencing tasks...</p>
        </div>
      </PlanContent>
    </Plan>
  ),
};
