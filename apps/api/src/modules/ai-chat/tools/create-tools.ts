/**
 * AI Tool Set 생성 함수
 *
 * @repo/ai-types의 toolDefinitions를 기반으로 완전한 tool set 생성
 * - 타입 안전성: AI SDK v5의 타입 추론 완벽 지원
 * - Single Source of Truth: toolDefinitions에서 스키마 가져오기
 * - Execute 주입: 백엔드 비즈니스 로직을 execute 함수로 주입
 */

import { tool } from "ai";
import { toolDefinitions } from "@repo/ai-types";

import { log } from "../../../lib/logger";
import { learningModuleCommandService } from "../../learning-plan/services/learning-module.command.service";
import { learningModuleQueryService } from "../../learning-plan/services/learning-module.query.service";
import { learningTaskCommandService } from "../../learning-plan/services/learning-task.command.service";
import { learningTaskQueryService } from "../../learning-plan/services/learning-task.query.service";
import { learningPlanQueryService } from "../../learning-plan/services/learning-plan.query.service";

import type { AppToolSet } from "@repo/ai-types";

/**
 * Tool Set 생성 함수
 *
 * @param userId - 사용자 ID (권한 검증용)
 * @param learningPlanId - 학습 계획 ID (컨텍스트)
 * @returns AppToolSet - 타입 안전한 AI tool set
 */
export function createTools(
  userId: string,
  learningPlanId: string,
): AppToolSet {
  return {
    // ============================================================
    // Learning Module Tools
    // ============================================================
    createModule: tool({
      description: toolDefinitions.createModule.description,
      inputSchema: toolDefinitions.createModule.inputSchema,
      outputSchema: toolDefinitions.createModule.outputSchema,
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
            success: true as const,
            data: result,
          };
        } catch (error) {
          log.error("Failed to create module via AI tool", {
            error: error instanceof Error ? error.message : "Unknown error",
            learningPlanId,
            userId,
          });
          return {
            success: false as const,
            error: "모듈 생성에 실패했습니다.",
          };
        }
      },
    }),

    updateModule: tool({
      description: toolDefinitions.updateModule.description,
      inputSchema: toolDefinitions.updateModule.inputSchema,
      outputSchema: toolDefinitions.updateModule.outputSchema,
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
            success: true as const,
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
            success: false as const,
            error: "모듈 수정에 실패했습니다.",
          };
        }
      },
    }),

    deleteModule: tool({
      description: toolDefinitions.deleteModule.description,
      inputSchema: toolDefinitions.deleteModule.inputSchema,
      outputSchema: toolDefinitions.deleteModule.outputSchema,
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
            success: true as const,
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
            success: false as const,
            error: "모듈 삭제에 실패했습니다.",
          };
        }
      },
    }),

    listModules: tool({
      description: toolDefinitions.listModules.description,
      inputSchema: toolDefinitions.listModules.inputSchema,
      outputSchema: toolDefinitions.listModules.outputSchema,
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
            success: true as const,
            data: modules,
          };
        } catch (error) {
          log.error("Failed to list modules via AI tool", {
            error: error instanceof Error ? error.message : "Unknown error",
            learningPlanId,
            userId,
          });
          return {
            success: false as const,
            error: "모듈 목록 조회에 실패했습니다.",
          };
        }
      },
    }),

    // ============================================================
    // Learning Task Tools
    // ============================================================
    createTask: tool({
      description: toolDefinitions.createTask.description,
      inputSchema: toolDefinitions.createTask.inputSchema,
      outputSchema: toolDefinitions.createTask.outputSchema,
      execute: async ({ moduleId, title, description, dueDate }) => {
        try {
          const result = await learningTaskCommandService.createTask({
            userId,
            learningModuleId: moduleId,
            title,
            description: description || null,
            dueDate: dueDate || null,
          });

          log.info("Task created via AI tool", {
            taskId: result.id,
            moduleId,
            learningPlanId,
            userId,
          });

          return {
            success: true as const,
            data: result,
          };
        } catch (error) {
          log.error("Failed to create task via AI tool", {
            error: error instanceof Error ? error.message : "Unknown error",
            moduleId,
            learningPlanId,
            userId,
          });
          return {
            success: false as const,
            error: "태스크 생성에 실패했습니다.",
          };
        }
      },
    }),

    updateTask: tool({
      description: toolDefinitions.updateTask.description,
      inputSchema: toolDefinitions.updateTask.inputSchema,
      outputSchema: toolDefinitions.updateTask.outputSchema,
      execute: async ({
        taskId,
        title,
        description,
        isCompleted,
        dueDate,
        memo,
      }) => {
        try {
          const result = await learningTaskCommandService.updateTask({
            userId,
            learningTaskId: taskId,
            title,
            description,
            isCompleted,
            dueDate,
            memo,
          });

          log.info("Task updated via AI tool", {
            taskId,
            learningPlanId,
            userId,
          });

          return {
            success: true as const,
            data: result,
          };
        } catch (error) {
          log.error("Failed to update task via AI tool", {
            error: error instanceof Error ? error.message : "Unknown error",
            taskId,
            learningPlanId,
            userId,
          });
          return {
            success: false as const,
            error: "태스크 수정에 실패했습니다.",
          };
        }
      },
    }),

    deleteTask: tool({
      description: toolDefinitions.deleteTask.description,
      inputSchema: toolDefinitions.deleteTask.inputSchema,
      outputSchema: toolDefinitions.deleteTask.outputSchema,
      execute: async ({ taskId }) => {
        try {
          const result = await learningTaskCommandService.deleteTask({
            userId,
            learningTaskId: taskId,
          });

          log.info("Task deleted via AI tool", {
            taskId,
            learningPlanId,
            userId,
          });

          return {
            success: true as const,
            data: result,
          };
        } catch (error) {
          log.error("Failed to delete task via AI tool", {
            error: error instanceof Error ? error.message : "Unknown error",
            taskId,
            learningPlanId,
            userId,
          });
          return {
            success: false as const,
            error: "태스크 삭제에 실패했습니다.",
          };
        }
      },
    }),

    completeTasks: tool({
      description: toolDefinitions.completeTasks.description,
      inputSchema: toolDefinitions.completeTasks.inputSchema,
      outputSchema: toolDefinitions.completeTasks.outputSchema,
      execute: async ({ taskIds }) => {
        try {
          // Update each task to mark as completed
          const results = await Promise.all(
            taskIds.map(async (taskId) => {
              try {
                return await learningTaskCommandService.updateTask({
                  userId,
                  learningTaskId: taskId,
                  isCompleted: true,
                });
              } catch (error) {
                log.error("Failed to complete task", {
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                  taskId,
                  learningPlanId,
                  userId,
                });
                return null;
              }
            }),
          );

          const successCount = results.filter((r) => r !== null).length;

          log.info("Tasks completed via AI tool", {
            totalTasks: taskIds.length,
            successCount,
            learningPlanId,
            userId,
          });

          return {
            success: true as const,
            data: {
              completedCount: successCount,
              totalCount: taskIds.length,
              results: results.filter((r) => r !== null),
            },
          };
        } catch (error) {
          log.error("Failed to complete tasks via AI tool", {
            error: error instanceof Error ? error.message : "Unknown error",
            taskIds,
            learningPlanId,
            userId,
          });
          return {
            success: false as const,
            error: "태스크 완료 처리에 실패했습니다.",
          };
        }
      },
    }),

    listTasks: tool({
      description: toolDefinitions.listTasks.description,
      inputSchema: toolDefinitions.listTasks.inputSchema,
      outputSchema: toolDefinitions.listTasks.outputSchema,
      execute: async ({ moduleId }) => {
        try {
          const tasks = await learningTaskQueryService.listTasksByModule(
            learningPlanId,
            moduleId,
            userId,
          );

          log.info("Tasks listed via AI tool", {
            moduleId,
            learningPlanId,
            userId,
            count: tasks.length,
          });

          return {
            success: true as const,
            data: tasks,
          };
        } catch (error) {
          log.error("Failed to list tasks via AI tool", {
            error: error instanceof Error ? error.message : "Unknown error",
            moduleId,
            learningPlanId,
            userId,
          });
          return {
            success: false as const,
            error: "태스크 목록 조회에 실패했습니다.",
          };
        }
      },
    }),

    bulkUpdateTasks: tool({
      description: toolDefinitions.bulkUpdateTasks.description,
      inputSchema: toolDefinitions.bulkUpdateTasks.inputSchema,
      outputSchema: toolDefinitions.bulkUpdateTasks.outputSchema,
      execute: async ({ taskIds, updates, individualUpdates }) => {
        try {
          // Validate input
          if (!updates && !individualUpdates) {
            return {
              success: false as const,
              error:
                "updates 또는 individualUpdates 중 하나는 반드시 제공되어야 합니다.",
            };
          }

          log.info("Bulk updating tasks via AI tool", {
            learningPlanId,
            taskIds,
            updates,
            individualUpdates,
            userId,
          });

          const result = await learningTaskCommandService.bulkUpdateTasks({
            userId,
            learningPlanId,
            taskIds,
            updates: updates
              ? {
                  title: updates.title,
                  description: updates.description,
                  isCompleted: updates.isCompleted,
                  dueDate: updates.dueDate,
                  memo: updates.memo,
                }
              : undefined,
            individualUpdates: individualUpdates?.map((item) => ({
              taskId: item.taskId,
              updates: {
                title: item.updates.title,
                description: item.updates.description,
                isCompleted: item.updates.isCompleted,
                dueDate: item.updates.dueDate,
                memo: item.updates.memo,
              },
            })),
          });

          log.info("Tasks bulk updated via AI tool", {
            learningPlanId,
            userId,
            successCount: result.successCount,
            totalCount: result.totalCount,
          });

          return {
            success: true as const,
            data: {
              updatedTasks: result.updatedTasks,
              successCount: result.successCount,
              totalCount: result.totalCount,
              message: `${result.successCount}/${result.totalCount}개 태스크가 성공적으로 수정되었습니다.`,
            },
          };
        } catch (error) {
          log.error("Failed to bulk update tasks via AI tool", {
            error: error instanceof Error ? error.message : "Unknown error",
            learningPlanId,
            userId,
          });
          return {
            success: false as const,
            error: "태스크 일괄 수정에 실패했습니다.",
          };
        }
      },
    }),

    // ============================================================
    // Query Info Tools
    // ============================================================
    getProgress: tool({
      description: toolDefinitions.getProgress.description,
      inputSchema: toolDefinitions.getProgress.inputSchema,
      outputSchema: toolDefinitions.getProgress.outputSchema,
      execute: async () => {
        try {
          // Calculate progress
          const modules = await learningModuleQueryService.listModulesByPlan(
            learningPlanId,
            userId,
          );

          let totalTasks = 0;
          let completedTasks = 0;

          for (const module of modules) {
            const tasks = await learningTaskQueryService.listTasksByModule(
              learningPlanId,
              module.id,
              userId,
            );
            totalTasks += tasks.length;
            completedTasks += tasks.filter((t) => t.isCompleted).length;
          }

          const progressPercentage =
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0;

          log.info("Progress retrieved via AI tool", {
            learningPlanId,
            userId,
            totalTasks,
            completedTasks,
            progressPercentage,
          });

          return {
            success: true as const,
            data: {
              totalTasks,
              completedTasks,
              progressPercentage,
              totalModules: modules.length,
            },
          };
        } catch (error) {
          log.error("Failed to get progress via AI tool", {
            error: error instanceof Error ? error.message : "Unknown error",
            learningPlanId,
            userId,
          });
          return {
            success: false as const,
            error: "진도 조회에 실패했습니다.",
          };
        }
      },
    }),

    getPlanDetails: tool({
      description: toolDefinitions.getPlanDetails.description,
      inputSchema: toolDefinitions.getPlanDetails.inputSchema,
      outputSchema: toolDefinitions.getPlanDetails.outputSchema,
      execute: async () => {
        try {
          const plan = await learningPlanQueryService.getLearningPlan({
            publicId: learningPlanId,
            userId,
          });

          // Get modules with tasks
          const modules = await learningModuleQueryService.listModulesByPlan(
            learningPlanId,
            userId,
          );

          const modulesWithTasks = await Promise.all(
            modules.map(async (module) => {
              const tasks = await learningTaskQueryService.listTasksByModule(
                learningPlanId,
                module.id,
                userId,
              );

              return {
                id: module.id,
                title: module.title,
                description: module.description,
                order: module.order,
                isExpanded: module.isExpanded,
                tasks: tasks.map((task) => ({
                  id: task.id,
                  title: task.title,
                  description: task.description,
                  order: task.order,
                  isCompleted: task.isCompleted,
                  completedAt: task.completedAt,
                  dueDate: task.dueDate,
                  memo: task.memo,
                })),
              };
            }),
          );

          log.info("Plan details retrieved via AI tool", {
            learningPlanId,
            userId,
            moduleCount: modules.length,
          });

          return {
            success: true as const,
            data: {
              id: plan.id,
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
              modules: modulesWithTasks,
            },
          };
        } catch (error) {
          log.error("Failed to get plan details via AI tool", {
            error: error instanceof Error ? error.message : "Unknown error",
            learningPlanId,
            userId,
          });
          return {
            success: false as const,
            error: "학습 계획 상세 조회에 실패했습니다.",
          };
        }
      },
    }),

    getModuleDetails: tool({
      description: toolDefinitions.getModuleDetails.description,
      inputSchema: toolDefinitions.getModuleDetails.inputSchema,
      outputSchema: toolDefinitions.getModuleDetails.outputSchema,
      execute: async ({ moduleId }) => {
        try {
          const moduleWithTasks =
            await learningModuleQueryService.getModuleWithTasks({
              learningPlanId,
              learningModuleId: moduleId,
              userId,
            });

          log.info("Module details retrieved via AI tool", {
            moduleId,
            learningPlanId,
            userId,
            taskCount: moduleWithTasks.tasks.length,
          });

          return {
            success: true as const,
            data: {
              id: moduleWithTasks.id,
              title: moduleWithTasks.title,
              description: moduleWithTasks.description,
              order: moduleWithTasks.order,
              isExpanded: moduleWithTasks.isExpanded,
              tasks: moduleWithTasks.tasks.map((task) => ({
                id: task.id,
                title: task.title,
                description: task.description,
                order: task.order,
                isCompleted: task.isCompleted,
                completedAt: task.completedAt,
                dueDate: task.dueDate,
                memo: task.memo,
              })),
            },
          };
        } catch (error) {
          log.error("Failed to get module details via AI tool", {
            error: error instanceof Error ? error.message : "Unknown error",
            moduleId,
            learningPlanId,
            userId,
          });
          return {
            success: false as const,
            error: "모듈 상세 조회에 실패했습니다.",
          };
        }
      },
    }),
  } as AppToolSet;
}
