import { tool } from "ai";
import { z } from "zod";

import { log } from "../../../lib/logger";
import { learningModuleRepository } from "../../learning-plan/repositories/learning-module.repository";
import { learningPlanRepository } from "../../learning-plan/repositories/learning-plan.repository";

/**
 * Factory for getting learning progress tool
 */
export const createGetProgressTool = (userId: string, learningPlanId: string) =>
  tool({
    description:
      "학습 진도 통계를 조회합니다. 전체 태스크 수, 완료한 태스크 수, 진행률 등을 확인할 수 있습니다.",
    inputSchema: z.object({}),
    execute: async () => {
      try {
        // Find and verify plan ownership
        const plan = await learningPlanRepository.findByPublicId(
          learningPlanId,
          userId,
        );

        if (!plan) {
          return {
            success: false,
            error: "학습 계획을 찾을 수 없습니다.",
          };
        }

        // Get progress statistics
        const stats = await learningPlanRepository.getProgressStats(plan.id);

        // Calculate progress percentage
        const progressPercentage =
          stats.totalTasks > 0
            ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
            : 0;

        log.info("Progress retrieved successfully", {
          learningPlanId,
          userId,
          stats,
        });

        return {
          success: true,
          data: {
            totalTasks: stats.totalTasks,
            completedTasks: stats.completedTasks,
            progressPercentage,
            totalModules: stats.totalModules,
          },
        };
      } catch (error) {
        log.error("Failed to get progress", {
          error: error instanceof Error ? error.message : "Unknown error",
          learningPlanId,
          userId,
        });
        return {
          success: false,
          error: "진도 조회에 실패했습니다.",
        };
      }
    },
  });

/**
 * Factory for getting learning plan details tool
 */
export const createGetPlanDetailsTool = (
  userId: string,
  learningPlanId: string,
) =>
  tool({
    description:
      "학습 계획의 상세 정보를 조회합니다. 주제, 목표 기간, 주간 학습 시간, 모듈 및 태스크 전체 구조를 확인할 수 있습니다.",
    inputSchema: z.object({}),
    execute: async () => {
      try {
        // Find and verify plan with all modules and tasks
        const plan = await learningPlanRepository.findWithModulesAndTasks(
          learningPlanId,
          userId,
        );

        if (!plan) {
          return {
            success: false,
            error: "학습 계획을 찾을 수 없습니다.",
          };
        }

        log.info("Plan details retrieved successfully", {
          learningPlanId,
          userId,
          modulesCount: plan.modules.length,
        });

        return {
          success: true,
          data: {
            id: plan.publicId,
            title: plan.title,
            description: plan.description,
            emoji: plan.emoji,
            learningTopic: plan.learningTopic,
            userLevel: plan.userLevel,
            targetWeeks: plan.targetWeeks,
            weeklyHours: plan.weeklyHours,
            learningStyle: plan.learningStyle,
            preferredResources: plan.preferredResources,
            mainGoal: plan.mainGoal,
            modules: plan.modules.map((module) => ({
              id: module.publicId,
              title: module.title,
              description: module.description,
              order: module.order,
              isExpanded: module.isExpanded,
              tasks: module.tasks.map((task) => ({
                id: task.publicId,
                title: task.title,
                description: task.description,
                order: task.order,
                isCompleted: task.isCompleted,
                completedAt: task.completedAt?.toISOString() ?? null,
                dueDate: task.dueDate?.toISOString() ?? null,
                memo: task.memo,
              })),
            })),
          },
        };
      } catch (error) {
        log.error("Failed to get plan details", {
          error: error instanceof Error ? error.message : "Unknown error",
          learningPlanId,
          userId,
        });
        return {
          success: false,
          error: "학습 계획 상세 조회에 실패했습니다.",
        };
      }
    },
  });

/**
 * Factory for getting module details tool
 */
export const createGetModuleDetailsTool = (
  userId: string,
  learningPlanId: string,
) =>
  tool({
    description: "특정 모듈의 상세 정보와 포함된 모든 태스크를 조회합니다.",
    inputSchema: z.object({
      moduleId: z.string().describe("모듈 Public ID"),
    }),
    execute: async ({ moduleId }) => {
      try {
        // Find module with tasks
        const moduleData =
          await learningModuleRepository.findWithTasks(moduleId);

        if (!moduleData) {
          return {
            success: false,
            error: "모듈을 찾을 수 없습니다.",
          };
        }

        // Verify plan ownership
        const plan = await learningPlanRepository.findById(
          moduleData.learningPlanId,
        );

        if (!plan || plan.userId !== userId) {
          return {
            success: false,
            error: "모듈을 찾을 수 없습니다.",
          };
        }

        log.info("Module details retrieved successfully", {
          moduleId,
          learningPlanId,
          userId,
          tasksCount: moduleData.tasks.length,
        });

        return {
          success: true,
          data: {
            id: moduleData.publicId,
            title: moduleData.title,
            description: moduleData.description,
            order: moduleData.order,
            isExpanded: moduleData.isExpanded,
            tasks: moduleData.tasks.map((task) => ({
              id: task.publicId,
              title: task.title,
              description: task.description,
              order: task.order,
              isCompleted: task.isCompleted,
              completedAt: task.completedAt?.toISOString() ?? null,
              dueDate: task.dueDate?.toISOString() ?? null,
              memo: task.memo,
            })),
          },
        };
      } catch (error) {
        log.error("Failed to get module details", {
          error: error instanceof Error ? error.message : "Unknown error",
          moduleId,
          learningPlanId,
          userId,
        });
        return {
          success: false,
          error: "모듈 상세 조회에 실패했습니다.",
        };
      }
    },
  });
