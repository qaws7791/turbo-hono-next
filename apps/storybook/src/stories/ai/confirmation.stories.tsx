import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@repo/ui/ai/confirmation";

import type { ToolUIPart } from "ai";
import type { Meta, StoryObj } from "@storybook/react-vite";

const approvalRequestedState = "approval-requested" as ToolUIPart["state"];

const meta = {
  title: "AI Elements/Confirmation",
  component: Confirmation,
  tags: ["autodocs"],
} satisfies Meta<typeof Confirmation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ApprovalRequested: Story = {
  args: {
    state: "output-available",
  },
  render: () => (
    <div className="max-w-md">
      <Confirmation
        approval={{ id: "tool-approve" }}
        state={approvalRequestedState}
      >
        <ConfirmationTitle>Allow tool execution?</ConfirmationTitle>
        <ConfirmationRequest>
          <p className="text-muted-foreground text-sm">
            The assistant wants to call a tool with your data.
          </p>
        </ConfirmationRequest>
        <ConfirmationActions>
          <ConfirmationAction variant="secondary">Deny</ConfirmationAction>
          <ConfirmationAction>Approve</ConfirmationAction>
        </ConfirmationActions>
      </Confirmation>
    </div>
  ),
};

export const Approved: Story = {
  args: {
    state: "output-available",
  },
  render: () => (
    <div className="max-w-md">
      <Confirmation
        approval={{ id: "tool-approve", approved: true }}
        state="output-available"
      >
        <ConfirmationTitle>Tool approved</ConfirmationTitle>
        <ConfirmationAccepted>
          <p className="text-muted-foreground text-sm">
            Execution completed successfully.
          </p>
        </ConfirmationAccepted>
      </Confirmation>
    </div>
  ),
};

export const Rejected: Story = {
  args: {
    state: "output-available",
  },
  render: () => (
    <div className="max-w-md">
      <Confirmation
        approval={{
          id: "tool-approve",
          approved: false,
          reason: "Requires manual review",
        }}
        state={"output-denied" as ToolUIPart["state"]}
      >
        <ConfirmationTitle>Tool denied</ConfirmationTitle>
        <ConfirmationRejected>
          <p className="text-muted-foreground text-sm">
            Requires manual review before execution.
          </p>
        </ConfirmationRejected>
      </Confirmation>
    </div>
  ),
};
