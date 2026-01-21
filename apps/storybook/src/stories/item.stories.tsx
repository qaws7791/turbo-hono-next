import { Button } from "@repo/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@repo/ui/item";
import { CreditCard, Sparkles } from "lucide-react";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Item",
  component: Item,
  tags: ["autodocs"],
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ItemGroup className="max-w-md">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <CreditCard />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Payment method</ItemTitle>
          <ItemDescription>Visa ending in 4256</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            size="sm"
            variant="outline"
          >
            Update
          </Button>
        </ItemActions>
      </Item>
      <ItemSeparator />
      <Item variant="muted">
        <ItemMedia variant="icon">
          <Sparkles />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Pro plan</ItemTitle>
          <ItemDescription>Renews on May 12, 2025</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm">Manage</Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  ),
};
