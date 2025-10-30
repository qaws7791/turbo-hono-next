import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningModuleReorderRequestSchema,
  LearningModuleReorderResponseSchema,
  LearningPlanLearningModuleParamsSchema,
} from "../../../learning-plan/schema";

export const reorderLearningModuleRoute = createRoute({
  tags: ["LearningPlan LearningModules"],
  method: "patch",
  path: "/learning-plans/{learningPlanId}/learning-modules/{learningModuleId}/order",
  summary: "Reorder a learning module position",
  request: {
    params: LearningPlanLearningModuleParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: LearningModuleReorderRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Learning Module reordered successfully",
      content: {
        "application/json": {
          schema: LearningModuleReorderResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request - invalid order position",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
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
