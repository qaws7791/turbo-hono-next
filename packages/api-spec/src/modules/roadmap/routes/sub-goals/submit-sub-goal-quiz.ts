import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  RoadmapGoalSubGoalQuizParamsSchema,
} from "../../../roadmap/schema";
import {
  SubmitSubGoalQuizRequestSchema,
  SubmitSubGoalQuizResponseSchema,
} from "../../../ai/schema";

export const submitSubGoalQuizRoute = createRoute({
  tags: ["Roadmap Sub-Goals"],
  method: "post",
  path: "/roadmaps/{roadmapId}/sub-goals/{subGoalId}/quizzes/{quizId}/submissions",
  summary: "Submit answers for an AI-generated sub-goal quiz",
  request: {
    params: RoadmapGoalSubGoalQuizParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: SubmitSubGoalQuizRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Quiz submitted and evaluated successfully",
      content: {
        "application/json": {
          schema: SubmitSubGoalQuizResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request payload",
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
      description: "Access denied",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Quiz, sub-goal, or roadmap not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    409: {
      description: "Quiz is not ready or already submitted",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Server error while submitting the quiz",
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
