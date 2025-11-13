import { tool } from "ai";
import { z } from "zod";

/**
 * Tool for creating a learning task
 */
export const createTaskTool = tool({
  description:
    "학습 태스크를 생성합니다. 모듈 내에 구체적인 학습 활동이나 과제를 추가할 때 사용합니다.",
  inputSchema: z.object({
    moduleId: z.string().describe("모듈 Public ID"),
    title: z.string().describe("태스크 제목 (예: 'useState 공식 문서 읽기')"),
    description: z
      .string()
      .optional()
      .describe("태스크 설명 (예: '기본 사용법과 주의사항 파악')"),
  }),
  execute: async ({ moduleId, title, description }) => {
    return {
      success: true,
      action: "create_task",
      params: { moduleId, title, description },
    };
  },
});

/**
 * Tool for updating a learning task
 */
export const updateTaskTool = tool({
  description:
    "학습 태스크를 수정합니다. 제목, 설명, 완료 상태 등을 변경할 수 있습니다.",
  inputSchema: z.object({
    taskId: z.string().describe("태스크 Public ID"),
    title: z.string().optional().describe("새 제목"),
    description: z.string().optional().describe("새 설명"),
    isCompleted: z.boolean().optional().describe("완료 여부"),
    memo: z.string().optional().describe("메모"),
  }),
  execute: async ({ taskId, title, description, isCompleted, memo }) => {
    return {
      success: true,
      action: "update_task",
      params: { taskId, title, description, isCompleted, memo },
    };
  },
});

/**
 * Tool for deleting a learning task
 */
export const deleteTaskTool = tool({
  description: "학습 태스크를 삭제합니다.",
  inputSchema: z.object({
    taskId: z.string().describe("삭제할 태스크의 Public ID"),
  }),
  execute: async ({ taskId }) => {
    return {
      success: true,
      action: "delete_task",
      params: { taskId },
    };
  },
});

/**
 * Tool for marking multiple tasks as completed
 */
export const completeTasksTool = tool({
  description: "여러 태스크를 한 번에 완료 처리합니다.",
  inputSchema: z.object({
    taskIds: z.array(z.string()).describe("완료 처리할 태스크 ID 배열"),
  }),
  execute: async ({ taskIds }) => {
    return {
      success: true,
      action: "complete_tasks",
      params: { taskIds },
    };
  },
});

/**
 * Tool for listing tasks in a module
 */
export const listTasksTool = tool({
  description: "특정 모듈의 모든 태스크 목록을 조회합니다.",
  inputSchema: z.object({
    moduleId: z.string().describe("모듈 Public ID"),
  }),
  execute: async ({ moduleId }) => {
    return {
      success: true,
      action: "list_tasks",
      params: { moduleId },
    };
  },
});
