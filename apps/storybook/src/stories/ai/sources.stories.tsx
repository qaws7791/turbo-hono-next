import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@repo/ui/ai/sources";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "AI Elements/Sources",
  component: Sources,
  tags: ["autodocs"],
} satisfies Meta<typeof Sources>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sources>
      <SourcesTrigger count={2} />
      <SourcesContent>
        <Source
          href="https://react-spectrum.adobe.com/react-aria/"
          title="React Aria"
        />
        <Source
          href="https://storybook.js.org/"
          title="Storybook"
        />
      </SourcesContent>
    </Sources>
  ),
};
