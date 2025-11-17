import { ToolExecutionCard } from "@repo/ui/ai";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "AI/ToolExecutionCard",
  component: ToolExecutionCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ToolExecutionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 실행 중 상태 (input-streaming)
 */
export const Streaming: Story = {
  args: {
    toolName: "createModule",
    state: "input-streaming",
    children: <p className="text-gray-600">모듈 생성 중...</p>,
  },
};

/**
 * 입력 준비 완료 상태 (input-available)
 */
export const InputAvailable: Story = {
  args: {
    toolName: "createTask",
    state: "input-available",
    children: <p className="text-gray-600">태스크 생성 준비 중...</p>,
  },
};

/**
 * 성공 완료 상태 (output-available)
 */
export const Success: Story = {
  args: {
    toolName: "getProgress",
    state: "output-available",
    children: (
      <div className="space-y-2">
        <p className="text-green-700 font-medium">진행률 조회 완료</p>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">전체 진행률</span>
          <span className="text-lg font-bold text-blue-600">75%</span>
        </div>
      </div>
    ),
  },
};

/**
 * 에러 상태 (output-error)
 */
export const Error: Story = {
  args: {
    toolName: "deleteModule",
    state: "output-error",
    children: (
      <div className="space-y-1">
        <p className="text-red-700 font-medium">모듈 삭제 실패</p>
        <p className="text-sm text-red-600">
          모듈을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.
        </p>
      </div>
    ),
  },
};

/**
 * 커스텀 아이콘
 */
export const WithCustomIcon: Story = {
  args: {
    toolName: "bulkUpdateTasks",
    state: "output-available",
    icon: (
      <svg
        className="w-4 h-4 text-purple-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    ),
    children: (
      <div className="space-y-2">
        <p className="text-green-700 font-medium">
          10개의 태스크를 수정했습니다
        </p>
        <p className="text-sm text-gray-600">10 / 10 성공</p>
      </div>
    ),
  },
};
