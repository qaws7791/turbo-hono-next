import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@repo/ui/field";
import { Input } from "@repo/ui/input";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Field",
  component: Field,
  tags: ["autodocs"],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <FieldContent>
            <Input
              id="username"
              placeholder="@yourname"
            />
            <FieldDescription>
              Your public handle used across the app.
            </FieldDescription>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <FieldContent>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
            />
            <FieldError>Enter a valid email address.</FieldError>
          </FieldContent>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};
