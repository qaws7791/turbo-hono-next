import { tool } from "ai";
import { z } from "zod";

/**
 * Tool for creating a learning module
 */
export const createModuleTool = tool({
  description:
    "학습 모듈을 생성합니다. 학습 계획에 새로운 주제나 단원을 추가할 때 사용합니다.",
  inputSchema: z.object({
    learningPlanId: z.string().describe("학습 계획의 Public ID (예: 'abc123')"),
    title: z.string().describe("모듈 제목 (예: 'React Hooks 기초')"),
    description: z
      .string()
      .optional()
      .describe("모듈 설명 (예: 'useState, useEffect 학습')"),
  }),
  execute: async ({ learningPlanId, title, description }) => {
    return {
      success: true,
      action: "create_module",
      params: { learningPlanId, title, description },
    };
  },
});

/**
 * Tool for updating a learning module
 */
export const updateModuleTool = tool({
  description: "학습 모듈의 제목이나 설명을 수정합니다.",
  inputSchema: z.object({
    moduleId: z.string().describe("모듈 Public ID"),
    title: z.string().optional().describe("새 제목"),
    description: z.string().optional().describe("새 설명"),
  }),
  execute: async ({ moduleId, title, description }) => {
    return {
      success: true,
      action: "update_module",
      params: { moduleId, title, description },
    };
  },
});

/**
 * Tool for deleting a learning module
 */
export const deleteModuleTool = tool({
  description:
    "학습 모듈을 삭제합니다. 모듈에 속한 모든 태스크도 함께 삭제됩니다.",
  inputSchema: z.object({
    moduleId: z.string().describe("삭제할 모듈의 Public ID"),
  }),
  execute: async ({ moduleId }) => {
    return {
      success: true,
      action: "delete_module",
      params: { moduleId },
    };
  },
});

/**
 * Tool for listing learning modules
 */
export const listModulesTool = tool({
  description: "학습 계획의 모든 모듈 목록을 조회합니다.",
  inputSchema: z.object({
    learningPlanId: z.string().describe("학습 계획의 Public ID"),
  }),
  execute: async ({ learningPlanId }) => {
    return {
      success: true,
      action: "list_modules",
      params: { learningPlanId },
    };
  },
});
