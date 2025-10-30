import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  GenerateLearningPlanRequestSchema,
  GenerateLearningPlanResponseSchema,
  GenerateLearningTaskNoteParamsSchema,
  GenerateLearningTaskNoteQuerySchema,
  GenerateLearningTaskNoteResponseSchema,
  GenerateLearningTaskQuizParamsSchema,
  GenerateLearningTaskQuizQuerySchema,
  GenerateLearningTaskQuizResponseSchema,
} from "./schema";

export const generateLearningPlanRoute = createRoute({
  tags: ["AI"],
  method: "post",
  path: "/ai/learning-plans/generate",
  summary: "Generate a personalized learning learningPlan using AI",
  request: {
    body: {
      content: {
        "application/json": {
          schema: GenerateLearningPlanRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "LearningPlan generated successfully",
      content: {
        "application/json": {
          schema: GenerateLearningPlanResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request - validation failed",
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
    429: {
      description: "Rate limit exceeded",
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

export const generateLearningTaskNoteRoute = createRoute({
  tags: ["AI"],
  method: "post",
  path: "/ai/learning-plans/{learningPlanId}/learning-tasks/{learningTaskId}/notes",
  summary: "Generate or refresh AI learning note for a learning-task",
  request: {
    params: GenerateLearningTaskNoteParamsSchema,
    query: GenerateLearningTaskNoteQuerySchema,
  },
  responses: {
    202: {
      description: "Note generation started",
      content: {
        "application/json": {
          schema: GenerateLearningTaskNoteResponseSchema,
        },
      },
    },
    200: {
      description: "Existing note status returned",
      content: {
        "application/json": {
          schema: GenerateLearningTaskNoteResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: GenerateLearningTaskNoteResponseSchema,
        },
      },
    },
    401: {
      description: "Authentication required",
      content: {
        "application/json": {
          schema: GenerateLearningTaskNoteResponseSchema,
        },
      },
    },
    403: {
      description: "Access denied",
      content: {
        "application/json": {
          schema: GenerateLearningTaskNoteResponseSchema,
        },
      },
    },
    404: {
      description: "Target learningPlan or learning-task not found",
      content: {
        "application/json": {
          schema: GenerateLearningTaskNoteResponseSchema,
        },
      },
    },
    500: {
      description: "Server error while generating the note",
      content: {
        "application/json": {
          schema: GenerateLearningTaskNoteResponseSchema,
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

export const generateLearningTaskQuizRoute = createRoute({
  tags: ["AI"],
  method: "post",
  path: "/ai/learning-plans/{learningPlanId}/learning-tasks/{learningTaskId}/quizzes",
  summary: "Generate or refresh an AI quiz for a learning-task",
  request: {
    params: GenerateLearningTaskQuizParamsSchema,
    query: GenerateLearningTaskQuizQuerySchema,
  },
  responses: {
    202: {
      description: "Quiz generation started",
      content: {
        "application/json": {
          schema: GenerateLearningTaskQuizResponseSchema,
        },
      },
    },
    200: {
      description: "Existing quiz status returned",
      content: {
        "application/json": {
          schema: GenerateLearningTaskQuizResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: GenerateLearningTaskQuizResponseSchema,
        },
      },
    },
    401: {
      description: "Authentication required",
      content: {
        "application/json": {
          schema: GenerateLearningTaskQuizResponseSchema,
        },
      },
    },
    403: {
      description: "Access denied",
      content: {
        "application/json": {
          schema: GenerateLearningTaskQuizResponseSchema,
        },
      },
    },
    404: {
      description: "Target learningPlan or learning-task not found",
      content: {
        "application/json": {
          schema: GenerateLearningTaskQuizResponseSchema,
        },
      },
    },
    500: {
      description: "Server error while generating the quiz",
      content: {
        "application/json": {
          schema: GenerateLearningTaskQuizResponseSchema,
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

export const aiRoutes = [
  generateLearningPlanRoute,
  generateLearningTaskNoteRoute,
  generateLearningTaskQuizRoute,
] as const;
