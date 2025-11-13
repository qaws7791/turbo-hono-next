import { tool } from "ai";
import { z } from "zod";

import { log } from "../../../lib/logger";
import { learningModuleCommandService } from "../../learning-plan/services/learning-module.command.service";
import { learningModuleQueryService } from "../../learning-plan/services/learning-module.query.service";

/**
 * Factory for creating a learning module tool
 */
export const createCreateModuleTool = (userId: string) =>
  tool({
    description:
      "학습 모듈을 생성합니다. 학습 계획에 새로운 주제나 단원을 추가할 때 사용합니다.",
    inputSchema: z.object({
      learningPlanId: z
        .string()
        .describe("학습 계획의 Public ID (예: 'abc123')"),
      title: z.string().describe("모듈 제목 (예: 'React Hooks 기초')"),
      description: z
        .string()
        .optional()
        .describe("모듈 설명 (예: 'useState, useEffect 학습')"),
    }),
    execute: async ({ learningPlanId, title, description }) => {
      try {
        const result = await learningModuleCommandService.createModule({
          userId,
          learningPlanId,
          title,
          description: description || null,
        });

        log.info("Module created via AI tool", {
          moduleId: result.id,
          learningPlanId,
          userId,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        log.error("Failed to create module via AI tool", {
          error: error instanceof Error ? error.message : "Unknown error",
          learningPlanId,
          userId,
        });
        return {
          success: false,
          error: "모듈 생성에 실패했습니다.",
        };
      }
    },
  });

/**
 * Factory for updating a learning module tool
 */
export const createUpdateModuleTool = (userId: string) =>
  tool({
    description: "학습 모듈의 제목이나 설명을 수정합니다.",
    inputSchema: z.object({
      moduleId: z.string().describe("모듈 Public ID"),
      title: z.string().optional().describe("새 제목"),
      description: z.string().optional().describe("새 설명"),
    }),
    execute: async ({ moduleId, title, description }) => {
      try {
        const result = await learningModuleCommandService.updateModule({
          userId,
          learningModuleId: moduleId,
          title,
          description,
        });

        log.info("Module updated via AI tool", {
          moduleId,
          userId,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        log.error("Failed to update module via AI tool", {
          error: error instanceof Error ? error.message : "Unknown error",
          moduleId,
          userId,
        });
        return {
          success: false,
          error: "모듈 수정에 실패했습니다.",
        };
      }
    },
  });

/**
 * Factory for deleting a learning module tool
 */
export const createDeleteModuleTool = (userId: string) =>
  tool({
    description:
      "학습 모듈을 삭제합니다. 모듈에 속한 모든 태스크도 함께 삭제됩니다.",
    inputSchema: z.object({
      moduleId: z.string().describe("삭제할 모듈의 Public ID"),
    }),
    execute: async ({ moduleId }) => {
      try {
        const result = await learningModuleCommandService.deleteModule({
          userId,
          learningModuleId: moduleId,
        });

        log.info("Module deleted via AI tool", {
          moduleId,
          userId,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        log.error("Failed to delete module via AI tool", {
          error: error instanceof Error ? error.message : "Unknown error",
          moduleId,
          userId,
        });
        return {
          success: false,
          error: "모듈 삭제에 실패했습니다.",
        };
      }
    },
  });

/**
 * Factory for listing learning modules tool
 */
export const createListModulesTool = (userId: string) =>
  tool({
    description: "학습 계획의 모든 모듈 목록을 조회합니다.",
    inputSchema: z.object({
      learningPlanId: z.string().describe("학습 계획의 Public ID"),
    }),
    execute: async ({ learningPlanId }) => {
      try {
        const modules = await learningModuleQueryService.listModulesByPlan(
          learningPlanId,
          userId,
        );

        log.info("Modules listed via AI tool", {
          learningPlanId,
          userId,
          count: modules.length,
        });

        return {
          success: true,
          data: modules,
        };
      } catch (error) {
        log.error("Failed to list modules via AI tool", {
          error: error instanceof Error ? error.message : "Unknown error",
          learningPlanId,
          userId,
        });
        return {
          success: false,
          error: "모듈 목록 조회에 실패했습니다.",
        };
      }
    },
  });
