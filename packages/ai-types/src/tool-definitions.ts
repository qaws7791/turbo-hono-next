/**
 * AI Tool Definitions
 *
 * AI SDK v5의 타입 추론을 활용하기 위한 tool 정의
 * - toolDefinitions: 각 tool의 스키마와 설명 정의 (execute 함수 제외)
 * - AppToolSet: AI SDK tool() 함수로 생성된 완전한 tool set의 타입
 *
 * @remarks
 * execute 함수는 백엔드(apps/api)에서 주입됨
 * 프론트엔드는 이 파일의 타입만 사용하여 타입 안전성 확보
 */

import {
  bulkUpdateTasksInputSchema,
  bulkUpdateTasksOutputSchema,
  completeTasksInputSchema,
  completeTasksOutputSchema,
  createModuleInputSchema,
  createModuleOutputSchema,
  createTaskInputSchema,
  createTaskOutputSchema,
  deleteModuleInputSchema,
  deleteModuleOutputSchema,
  deleteTaskInputSchema,
  deleteTaskOutputSchema,
  getModuleDetailsInputSchema,
  getModuleDetailsOutputSchema,
  getPlanDetailsInputSchema,
  getPlanDetailsOutputSchema,
  getProgressInputSchema,
  getProgressOutputSchema,
  listModulesInputSchema,
  listModulesOutputSchema,
  listTasksInputSchema,
  listTasksOutputSchema,
  updateModuleInputSchema,
  updateModuleOutputSchema,
  updateTaskInputSchema,
  updateTaskOutputSchema,
} from "./tools";

import type { tool } from "ai";
import type { z } from "zod";

/**
 * Tool 정의 (스키마만 포함, execute 제외)
 * 백엔드에서 execute 함수를 주입하여 완전한 tool 생성
 */
export const toolDefinitions = {
  // ============================================================
  // Learning Module Tools
  // ============================================================
  createModule: {
    description:
      "학습 모듈을 생성합니다. 학습 계획에 새로운 주제나 단원을 추가할 때 사용합니다.",
    inputSchema: createModuleInputSchema,
    outputSchema: createModuleOutputSchema,
  },
  updateModule: {
    description: "학습 모듈의 제목이나 설명을 수정합니다.",
    inputSchema: updateModuleInputSchema,
    outputSchema: updateModuleOutputSchema,
  },
  deleteModule: {
    description:
      "학습 모듈을 삭제합니다. 모듈에 속한 모든 태스크도 함께 삭제됩니다.",
    inputSchema: deleteModuleInputSchema,
    outputSchema: deleteModuleOutputSchema,
  },
  listModules: {
    description: "학습 계획의 모든 모듈 목록을 조회합니다.",
    inputSchema: listModulesInputSchema,
    outputSchema: listModulesOutputSchema,
  },

  // ============================================================
  // Learning Task Tools
  // ============================================================
  createTask: {
    description:
      "학습 태스크를 생성합니다. 모듈 내에 구체적인 학습 활동이나 과제를 추가할 때 사용합니다.",
    inputSchema: createTaskInputSchema,
    outputSchema: createTaskOutputSchema,
  },
  updateTask: {
    description:
      "학습 태스크를 수정합니다. 제목, 설명, 완료 상태, 마감일 등을 변경할 수 있습니다.",
    inputSchema: updateTaskInputSchema,
    outputSchema: updateTaskOutputSchema,
  },
  deleteTask: {
    description: "학습 태스크를 삭제합니다.",
    inputSchema: deleteTaskInputSchema,
    outputSchema: deleteTaskOutputSchema,
  },
  completeTasks: {
    description: "여러 태스크를 한 번에 완료 처리합니다.",
    inputSchema: completeTasksInputSchema,
    outputSchema: completeTasksOutputSchema,
  },
  listTasks: {
    description: "특정 모듈의 모든 태스크 목록을 조회합니다.",
    inputSchema: listTasksInputSchema,
    outputSchema: listTasksOutputSchema,
  },
  bulkUpdateTasks: {
    description:
      "여러 학습 태스크를 한 번에 수정합니다. 마감일 일괄 설정, 완료 상태 변경 등 대량 작업에 사용합니다. 모든 태스크에 같은 값을 적용하거나, 각 태스크마다 다른 값을 적용할 수 있습니다.",
    inputSchema: bulkUpdateTasksInputSchema,
    outputSchema: bulkUpdateTasksOutputSchema,
  },

  // ============================================================
  // Query Info Tools
  // ============================================================
  getProgress: {
    description: "현재 학습 계획의 전체 진도를 조회합니다.",
    inputSchema: getProgressInputSchema,
    outputSchema: getProgressOutputSchema,
  },
  getPlanDetails: {
    description: "학습 계획의 상세 정보를 모듈과 태스크를 포함하여 조회합니다.",
    inputSchema: getPlanDetailsInputSchema,
    outputSchema: getPlanDetailsOutputSchema,
  },
  getModuleDetails: {
    description: "특정 모듈의 상세 정보를 태스크 목록과 함께 조회합니다.",
    inputSchema: getModuleDetailsInputSchema,
    outputSchema: getModuleDetailsOutputSchema,
  },
} as const;

/**
 * Tool 이름 타입 (유니온)
 */
export type ToolName = keyof typeof toolDefinitions;

/**
 * 완전한 Tool Set 타입
 * AI SDK의 tool() 함수로 생성된 tools의 타입
 *
 * @remarks
 * ReturnType<typeof tool<...>>를 사용하여 AI SDK의 타입 추론 활용
 * 실제 tool 인스턴스는 백엔드에서 생성됨
 */
export type AppToolSet = {
  [K in ToolName]: ReturnType<
    typeof tool<
      z.infer<(typeof toolDefinitions)[K]["inputSchema"]>,
      z.infer<(typeof toolDefinitions)[K]["outputSchema"]>
    >
  >;
};

/**
 * Tool별 Input 타입 매핑
 */
export type ToolInputs = {
  [K in ToolName]: z.infer<(typeof toolDefinitions)[K]["inputSchema"]>;
};

/**
 * Tool별 Output 타입 매핑
 */
export type ToolOutputs = {
  [K in ToolName]: z.infer<(typeof toolDefinitions)[K]["outputSchema"]>;
};
