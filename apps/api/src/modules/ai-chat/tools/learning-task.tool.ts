import { tool } from "ai";
import { z } from "zod";

import { log } from "../../../lib/logger";
import { learningTaskCommandService } from "../../learning-plan/services/learning-task.command.service";
import { learningTaskQueryService } from "../../learning-plan/services/learning-task.query.service";

/**
 * Factory for creating a learning task tool
 */
export const createCreateTaskTool = (userId: string, learningPlanId: string) =>
  tool({
    description:
      "학습 태스크를 생성합니다. 모듈 내에 구체적인 학습 활동이나 과제를 추가할 때 사용합니다.",
    inputSchema: z.object({
      moduleId: z.string().describe("모듈 Public ID"),
      title: z.string().describe("태스크 제목 (예: 'useState 공식 문서 읽기')"),
      description: z
        .string()
        .optional()
        .describe("태스크 설명 (예: '기본 사용법과 주의사항 파악')"),
      dueDate: z
        .string()
        .optional()
        .describe("마감일 (ISO 8601 형식, 예: '2025-11-20T09:00:00Z')"),
    }),
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
          success: true,
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
          success: false,
          error: "태스크 생성에 실패했습니다.",
        };
      }
    },
  });

/**
 * Factory for updating a learning task tool
 */
export const createUpdateTaskTool = (userId: string, learningPlanId: string) =>
  tool({
    description:
      "학습 태스크를 수정합니다. 제목, 설명, 완료 상태, 마감일 등을 변경할 수 있습니다.",
    inputSchema: z.object({
      taskId: z.string().describe("태스크 Public ID"),
      title: z.string().optional().describe("새 제목"),
      description: z.string().optional().describe("새 설명"),
      isCompleted: z.boolean().optional().describe("완료 여부"),
      dueDate: z
        .string()
        .optional()
        .describe("마감일 (ISO 8601 형식, 예: '2025-11-20T09:00:00Z')"),
      memo: z.string().optional().describe("메모"),
    }),
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
          success: true,
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
          success: false,
          error: "태스크 수정에 실패했습니다.",
        };
      }
    },
  });

/**
 * Factory for deleting a learning task tool
 */
export const createDeleteTaskTool = (userId: string, learningPlanId: string) =>
  tool({
    description: "학습 태스크를 삭제합니다.",
    inputSchema: z.object({
      taskId: z.string().describe("삭제할 태스크의 Public ID"),
    }),
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
          success: true,
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
          success: false,
          error: "태스크 삭제에 실패했습니다.",
        };
      }
    },
  });

/**
 * Factory for marking multiple tasks as completed tool
 */
export const createCompleteTasksTool = (
  userId: string,
  learningPlanId: string,
) =>
  tool({
    description: "여러 태스크를 한 번에 완료 처리합니다.",
    inputSchema: z.object({
      taskIds: z.array(z.string()).describe("완료 처리할 태스크 ID 배열"),
    }),
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
                error: error instanceof Error ? error.message : "Unknown error",
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
          success: true,
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
          success: false,
          error: "태스크 완료 처리에 실패했습니다.",
        };
      }
    },
  });

/**
 * Factory for listing tasks in a module tool
 */
export const createListTasksTool = (userId: string, learningPlanId: string) =>
  tool({
    description: "특정 모듈의 모든 태스크 목록을 조회합니다.",
    inputSchema: z.object({
      moduleId: z.string().describe("모듈 Public ID"),
    }),
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
          success: true,
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
          success: false,
          error: "태스크 목록 조회에 실패했습니다.",
        };
      }
    },
  });

/**
 * Factory for bulk updating learning tasks tool
 */
export const createBulkUpdateTasksTool = (
  userId: string,
  learningPlanId: string,
) =>
  tool({
    description:
      "여러 학습 태스크를 한 번에 수정합니다. 마감일 일괄 설정, 완료 상태 변경 등 대량 작업에 사용합니다. 모든 태스크에 같은 값을 적용하거나, 각 태스크마다 다른 값을 적용할 수 있습니다.",
    inputSchema: z.object({
      taskIds: z
        .array(z.string())
        .describe("수정할 태스크 Public ID 배열 (최대 100개)"),
      updates: z
        .object({
          title: z.string().optional().describe("모든 태스크에 적용할 새 제목"),
          description: z
            .string()
            .optional()
            .describe("모든 태스크에 적용할 새 설명"),
          isCompleted: z
            .boolean()
            .optional()
            .describe("모든 태스크에 적용할 완료 여부"),
          dueDate: z
            .string()
            .optional()
            .describe(
              "모든 태스크에 적용할 마감일 (ISO 8601 형식, 예: '2025-11-20T09:00:00Z')",
            ),
          memo: z.string().optional().describe("모든 태스크에 적용할 메모"),
        })
        .optional()
        .describe("모든 태스크에 동일하게 적용할 값들"),
      individualUpdates: z
        .array(
          z.object({
            taskId: z.string().describe("태스크 Public ID"),
            updates: z.object({
              title: z.string().optional().describe("새 제목"),
              description: z.string().optional().describe("새 설명"),
              isCompleted: z.boolean().optional().describe("완료 여부"),
              dueDate: z.string().optional().describe("마감일 (ISO 8601 형식)"),
              memo: z.string().optional().describe("메모"),
            }),
          }),
        )
        .optional()
        .describe("각 태스크별로 다르게 적용할 값들 (예: 순차적 마감일 설정)"),
    }),
    execute: async ({ taskIds, updates, individualUpdates }) => {
      try {
        // Validate input
        if (!updates && !individualUpdates) {
          return {
            success: false,
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
          success: true,
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
          success: false,
          error: "태스크 일괄 수정에 실패했습니다.",
        };
      }
    },
  });
