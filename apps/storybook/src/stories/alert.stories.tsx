import { AlertCircle, CheckCircle2, Popcorn } from "lucide-react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/alert";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <div className="grid w-full max-w-xl items-start gap-4">
      <Alert>
        <CheckCircle2 />
        <AlertTitle>Success! Your changes have been saved</AlertTitle>
        <AlertDescription>
          This is an alert with an icon, title, and description.
        </AlertDescription>
        <AlertAction>Undo</AlertAction>
      </Alert>
      <Alert>
        <Popcorn />
        <AlertTitle>This alert has a title and an icon.</AlertTitle>
      </Alert>
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Unable to process your payment.</AlertTitle>
        <AlertDescription>
          <p>Please verify your billing information and try again.</p>
          <ul className="list-inside list-disc text-sm">
            <li>Check your card details</li>
            <li>Ensure sufficient funds</li>
            <li>Verify billing address</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  ),
};
