import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanLearningModuleLearningTaskParamsSchema,
  LearningTaskDeletionResponseSchema,
} from "../../../learning-plan/schema";

export const deleteLearningTaskRoute = createRoute({
  tags: ["LearningPlan Sub-LearningModules"],
  method: "delete",
  path: "/learning-plans/{learningPlanId}/learning-modules/{learningModuleId}/learning-tasks/{learningTaskId}",
  summary: "Delete a learning-task",
  request: {
    params: LearningPlanLearningModuleLearningTaskParamsSchema,
  },
  responses: {
    200: {
      description: "Learning-task deleted successfully",
      content: {
        "application/json": {
          schema: LearningTaskDeletionResponseSchema,
        },
      },
    },
    401: {
      description: "Authentication required",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Access denied - not learningPlan owner",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "LearningPlan, learningModule, or learning-task not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
});
