import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  GenerateRoadmapRequestSchema,
  GenerateRoadmapResponseSchema,
  GenerateSubGoalNoteParamsSchema,
  GenerateSubGoalNoteQuerySchema,
  GenerateSubGoalNoteResponseSchema,
  GenerateSubGoalQuizParamsSchema,
  GenerateSubGoalQuizQuerySchema,
  GenerateSubGoalQuizResponseSchema,
} from "./schema";

export const generateRoadmapRoute = createRoute({
  tags: ["AI"],
  method: "post",
  path: "/ai/roadmaps/generate",
  summary: "Generate a personalized learning roadmap using AI",
  request: {
    body: {
      content: {
        "application/json": {
          schema: GenerateRoadmapRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Roadmap generated successfully",
      content: {
        "application/json": {
          schema: GenerateRoadmapResponseSchema,
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

export const generateSubGoalNoteRoute = createRoute({
  tags: ["AI"],
  method: "post",
  path: "/ai/roadmaps/{roadmapId}/sub-goals/{subGoalId}/notes",
  summary: "Generate or refresh AI learning note for a sub-goal",
  request: {
    params: GenerateSubGoalNoteParamsSchema,
    query: GenerateSubGoalNoteQuerySchema,
  },
  responses: {
    202: {
      description: "Note generation started",
      content: {
        "application/json": {
          schema: GenerateSubGoalNoteResponseSchema,
        },
      },
    },
    200: {
      description: "Existing note status returned",
      content: {
        "application/json": {
          schema: GenerateSubGoalNoteResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: GenerateSubGoalNoteResponseSchema,
        },
      },
    },
    401: {
      description: "Authentication required",
      content: {
        "application/json": {
          schema: GenerateSubGoalNoteResponseSchema,
        },
      },
    },
    403: {
      description: "Access denied",
      content: {
        "application/json": {
          schema: GenerateSubGoalNoteResponseSchema,
        },
      },
    },
    404: {
      description: "Target roadmap or sub-goal not found",
      content: {
        "application/json": {
          schema: GenerateSubGoalNoteResponseSchema,
        },
      },
    },
    500: {
      description: "Server error while generating the note",
      content: {
        "application/json": {
          schema: GenerateSubGoalNoteResponseSchema,
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

export const generateSubGoalQuizRoute = createRoute({
  tags: ["AI"],
  method: "post",
  path: "/ai/roadmaps/{roadmapId}/sub-goals/{subGoalId}/quizzes",
  summary: "Generate or refresh an AI quiz for a sub-goal",
  request: {
    params: GenerateSubGoalQuizParamsSchema,
    query: GenerateSubGoalQuizQuerySchema,
  },
  responses: {
    202: {
      description: "Quiz generation started",
      content: {
        "application/json": {
          schema: GenerateSubGoalQuizResponseSchema,
        },
      },
    },
    200: {
      description: "Existing quiz status returned",
      content: {
        "application/json": {
          schema: GenerateSubGoalQuizResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: GenerateSubGoalQuizResponseSchema,
        },
      },
    },
    401: {
      description: "Authentication required",
      content: {
        "application/json": {
          schema: GenerateSubGoalQuizResponseSchema,
        },
      },
    },
    403: {
      description: "Access denied",
      content: {
        "application/json": {
          schema: GenerateSubGoalQuizResponseSchema,
        },
      },
    },
    404: {
      description: "Target roadmap or sub-goal not found",
      content: {
        "application/json": {
          schema: GenerateSubGoalQuizResponseSchema,
        },
      },
    },
    500: {
      description: "Server error while generating the quiz",
      content: {
        "application/json": {
          schema: GenerateSubGoalQuizResponseSchema,
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
  generateRoadmapRoute,
  generateSubGoalNoteRoute,
  generateSubGoalQuizRoute,
] as const;
