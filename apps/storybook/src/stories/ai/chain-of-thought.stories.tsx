import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtImage,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "@repo/ui/ai/chain-of-thought";
import { Badge } from "@repo/ui/badge";

import type { Meta, StoryObj } from "@storybook/react-vite";

const placeholderImage =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDI0MCAxNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIxNjAiIGZpbGw9IiNlOGU4ZWQiLz48cGF0aCBkPSJNMTAgMTBoMjIwVjE1MEgxMFoiIGZpbGw9IiNkZWQ5ZmYiLz48L3N2Zz4=";

const meta = {
  title: "AI Elements/ChainOfThought",
  component: ChainOfThought,
  tags: ["autodocs"],
} satisfies Meta<typeof ChainOfThought>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ChainOfThought defaultOpen>
      <ChainOfThoughtHeader>Reasoning trace</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        <ChainOfThoughtStep
          label="Search reference docs"
          description="Collect key points from official docs."
        >
          <ChainOfThoughtSearchResults>
            <ChainOfThoughtSearchResult>react-aria</ChainOfThoughtSearchResult>
            <ChainOfThoughtSearchResult>streamdown</ChainOfThoughtSearchResult>
            <ChainOfThoughtSearchResult>tailwind</ChainOfThoughtSearchResult>
          </ChainOfThoughtSearchResults>
        </ChainOfThoughtStep>
        <ChainOfThoughtStep
          label="Draft response"
          status="active"
        >
          <Badge variant="secondary">Synthesizing steps</Badge>
        </ChainOfThoughtStep>
        <ChainOfThoughtStep
          label="Finalize answer"
          status="pending"
          description="Prepare final response."
        />
        <ChainOfThoughtImage caption="Supporting sketch">
          <img
            alt="Grid diagram"
            className="h-40 w-64 rounded-md object-cover"
            src={placeholderImage}
          />
        </ChainOfThoughtImage>
      </ChainOfThoughtContent>
    </ChainOfThought>
  ),
};
