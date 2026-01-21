import { Suggestion, Suggestions } from "@repo/ui/ai/suggestion";
import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "AI Elements/Suggestion",
  component: Suggestions,
  tags: ["autodocs"],
} satisfies Meta<typeof Suggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleSuggestions = [
  "Summarize the plan",
  "Generate a checklist",
  "Explain the key concepts",
  "Create quiz questions",
];

const SuggestionsDemo = () => {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <Suggestions>
        {sampleSuggestions.map((suggestion) => (
          <Suggestion
            key={suggestion}
            onClick={setPicked}
            suggestion={suggestion}
          />
        ))}
      </Suggestions>
      <p className="text-muted-foreground text-xs">
        {picked ? `Selected: ${picked}` : "Pick a suggestion to prefill"}
      </p>
    </div>
  );
};

export const Default: Story = {
  render: () => <SuggestionsDemo />,
};
