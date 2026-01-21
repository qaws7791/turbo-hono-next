import { CodeBlock, CodeBlockCopyButton } from "@repo/ui/ai/code-block";

import type { Meta, StoryObj } from "@storybook/react-vite";

const sampleCode = `type User = {
  id: string;
  name: string;
};

const byId = (users: User[]) =>
  users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {} as Record<string, User>);
`;

const meta = {
  title: "AI Elements/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  args: {
    code: sampleCode,
    language: "ts",
    showLineNumbers: true,
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <CodeBlock {...args}>
      <CodeBlockCopyButton aria-label="Copy code" />
    </CodeBlock>
  ),
};
