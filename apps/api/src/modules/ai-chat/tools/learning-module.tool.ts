import {
  createModuleInputSchema,
  createModuleOutputSchema,
  deleteModuleInputSchema,
  deleteModuleOutputSchema,
  listModulesInputSchema,
  listModulesOutputSchema,
  updateModuleInputSchema,
  updateModuleOutputSchema,
} from "@repo/ai-types";
import { tool } from "ai";

import { log } from "../../../lib/logger";
import { learningModuleCommandService } from "../../learning-plan/services/learning-module.command.service";
import { learningModuleQueryService } from "../../learning-plan/services/learning-module.query.service";

/**
 * Factory for creating a learning module tool
 */
export const createCreateModuleTool = (
  userId: string,
  learningPlanId: string,
) =>
  tool({
    description:
      "학습 모듈을 생성합니다. 학습 계획에 새로운 주제나 단원을 추가할 때 사용합니다.",
    inputSchema: createModuleInputSchema,
    outputSchema: createModuleOutputSchema,
    execute: async ({ title, description }) => {
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
export const createUpdateModuleTool = (
  userId: string,
  learningPlanId: string,
) =>
  tool({
    description: "학습 모듈의 제목이나 설명을 수정합니다.",
    inputSchema: updateModuleInputSchema,
    outputSchema: updateModuleOutputSchema,
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
          learningPlanId,
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
          learningPlanId,
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
export const createDeleteModuleTool = (
  userId: string,
  learningPlanId: string,
) =>
  tool({
    description:
      "학습 모듈을 삭제합니다. 모듈에 속한 모든 태스크도 함께 삭제됩니다.",
    inputSchema: deleteModuleInputSchema,
    outputSchema: deleteModuleOutputSchema,
    execute: async ({ moduleId }) => {
      try {
        const result = await learningModuleCommandService.deleteModule({
          userId,
          learningModuleId: moduleId,
        });

        log.info("Module deleted via AI tool", {
          moduleId,
          learningPlanId,
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
          learningPlanId,
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
export const createListModulesTool = (userId: string, learningPlanId: string) =>
  tool({
    description: "학습 계획의 모든 모듈 목록을 조회합니다.",
    inputSchema: listModulesInputSchema,
    outputSchema: listModulesOutputSchema,
    execute: async () => {
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
