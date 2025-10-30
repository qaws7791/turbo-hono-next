import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningModuleDeletionResponseSchema,
  LearningPlanLearningModuleParamsSchema,
} from "../../../learning-plan/schema";

export const deleteLearningModuleRoute = createRoute({
  tags: ["LearningPlan LearningModules"],
  method: "delete",
  path: "/learning-plans/{learningPlanId}/learning-modules/{learningModuleId}",
  summary: "Delete a learningModule",
  request: {
    params: LearningPlanLearningModuleParamsSchema,
  },
  responses: {
    200: {
      description: "Learning Module deleted successfully",
      content: {
        "application/json": {
          schema: LearningModuleDeletionResponseSchema,
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
      description: "Learning Module or learningPlan not found",
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
