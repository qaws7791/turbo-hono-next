import { tool } from "ai";
import { z } from "zod";

/**
 * Tool for getting learning progress
 */
export const getProgressTool = tool({
  description:
    "학습 진도 통계를 조회합니다. 전체 태스크 수, 완료한 태스크 수, 진행률 등을 확인할 수 있습니다.",
  inputSchema: z.object({
    learningPlanId: z.string().describe("학습 계획의 Public ID"),
  }),
  execute: async ({ learningPlanId }) => {
    return {
      success: true,
      action: "get_progress",
      params: { learningPlanId },
    };
  },
});

/**
 * Tool for getting learning plan details
 */
export const getPlanDetailsTool = tool({
  description:
    "학습 계획의 상세 정보를 조회합니다. 주제, 목표 기간, 주간 학습 시간, 모듈 및 태스크 전체 구조를 확인할 수 있습니다.",
  inputSchema: z.object({
    learningPlanId: z.string().describe("학습 계획의 Public ID"),
  }),
  execute: async ({ learningPlanId }) => {
    return {
      success: true,
      action: "get_plan_details",
      params: { learningPlanId },
    };
  },
});

/**
 * Tool for getting module details
 */
export const getModuleDetailsTool = tool({
  description: "특정 모듈의 상세 정보와 포함된 모든 태스크를 조회합니다.",
  inputSchema: z.object({
    moduleId: z.string().describe("모듈 Public ID"),
  }),
  execute: async ({ moduleId }) => {
    return {
      success: true,
      action: "get_module_details",
      params: { moduleId },
    };
  },
});
