import { z } from "@hono/zod-openapi";

import {
  AINoteStatusSchema,
  GenerateLearningTaskQuizResponseSchema,
} from "../ai/schema";
import { DocumentItemSchema } from "../documents/schema";

import { LearningPlanEmoji } from "./emoji";

const emojiSchema = z
  .string()
  .trim()
  .min(1, { message: "로드맵 이모지를 입력하세요." })
  .max(16, { message: "로드맵 이모지는 16자 이내여야 합니다." })
  .refine(LearningPlanEmoji.isValid, {
    message: "로드맵 이모지는 단일 이모지여야 합니다.",
  });

// Request schemas
export const LearningPlanListQuerySchema = z.object({
  cursor: z.string().optional().openapi({
    description: "Cursor for pagination (encoded string)",
    example: "eyJpZCI6MTIsImNyZWF0ZWRBdCI6IjIwMjQtMDEtMDEifQ==",
  }),
  limit: z.coerce.number().int().min(1).max(100).default(20).openapi({
    description: "Number of items to return",
    example: 20,
  }),
  search: z.string().optional().openapi({
    description: "Search query for title or description",
    example: "JavaScript learning",
  }),
  status: z.enum(["active", "archived"]).optional().openapi({
    description: "Filter by learningPlan status",
    example: "active",
  }),
  sort: z
    .enum(["created_at", "updated_at", "title"])
    .default("created_at")
    .openapi({
      description: "Sort field",
      example: "created_at",
    }),
  order: z.enum(["asc", "desc"]).default("desc").openapi({
    description: "Sort order",
    example: "desc",
  }),
});

// Response schemas
export const LearningPlanItemSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the learningPlan",
    example: "abc123def456",
  }),
  emoji: emojiSchema.openapi({
    description: "Emoji that represents the learningPlan at a glance",
    example: "🚀",
  }),
  title: z.string().openapi({
    description: "LearningPlan title",
    example: "Full Stack JavaScript Developer",
  }),
  description: z.string().nullable().openapi({
    description: "LearningPlan description",
    example: "Complete guide to becoming a full stack developer",
  }),
  status: z.enum(["active", "archived"]).openapi({
    description: "Current status of the learningPlan",
    example: "active",
  }),
  learningModuleCompletionPercent: z.number().int().min(0).max(100).openapi({
    description: "Percentage of completed learning-tasks (0-100)",
    example: 75,
  }),
  learningTopic: z.string().openapi({
    description: "Main learning topic",
    example: "JavaScript",
  }),
  userLevel: z.string().openapi({
    description: "Target user level",
    example: "beginner",
  }),
  targetWeeks: z.number().int().openapi({
    description: "Target completion weeks",
    example: 12,
  }),
  weeklyHours: z.number().int().openapi({
    description: "Weekly study hours",
    example: 10,
  }),
  learningStyle: z.string().openapi({
    description: "Preferred learning style",
    example: "실습 중심",
  }),
  preferredResources: z.string().openapi({
    description: "Preferred learning resources",
    example: "온라인 강의",
  }),
  mainGoal: z.string().openapi({
    description: "Main learning learningModule",
    example: "웹 개발자 취업",
  }),
  additionalRequirements: z.string().nullable().openapi({
    description: "Additional requirements",
    example: "React, Node.js 포함",
  }),
  createdAt: z.string().openapi({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "Last update timestamp",
    example: "2024-01-15T10:30:00.000Z",
  }),
  aiNoteStatus: AINoteStatusSchema,
  aiNoteMarkdown: z.string().nullable().openapi({
    description: "AI가 생성한 학습 노트 (마크다운)",
    example: "# 학습 개요\n- 목표 정리...",
  }),
  aiNoteRequestedAt: z.string().datetime().nullable().openapi({
    description: "AI 노트 생성을 요청한 시각",
    example: "2024-06-01T10:00:00.000Z",
  }),
  aiNoteCompletedAt: z.string().datetime().nullable().openapi({
    description: "AI 노트 생성이 완료되거나 실패한 시각",
    example: "2024-06-01T10:05:12.000Z",
  }),
  aiNoteError: z.string().nullable().openapi({
    description: "AI 노트 생성 실패 시 오류 메시지",
    example: "Gemini API 호출이 실패했습니다.",
  }),
});

export const LearningPlanListResponseSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().openapi({
          description: "Public ID of the learningPlan",
          example: "abc123def456",
        }),

        emoji: emojiSchema.openapi({
          description: "Emoji that represents the learningPlan at a glance",
          example: "🚀",
        }),
        title: z.string().openapi({
          description: "LearningPlan title",
          example: "Full Stack JavaScript Developer",
        }),
        description: z.string().nullable().openapi({
          description: "LearningPlan description",
          example: "Complete guide to becoming a full stack developer",
        }),
        status: z.enum(["active", "archived"]).openapi({
          description: "Current status of the learningPlan",
          example: "active",
        }),
        learningModuleCompletionPercent: z
          .number()
          .int()
          .min(0)
          .max(100)
          .openapi({
            description: "Percentage of completed learning-tasks (0-100)",
            example: 75,
          }),
        learningTopic: z.string().openapi({
          description: "Main learning topic",
          example: "JavaScript",
        }),
        userLevel: z.string().openapi({
          description: "Target user level",
          example: "beginner",
        }),
        targetWeeks: z.number().int().openapi({
          description: "Target completion weeks",
          example: 12,
        }),
        weeklyHours: z.number().int().openapi({
          description: "Weekly study hours",
          example: 10,
        }),
        learningStyle: z.string().openapi({
          description: "Preferred learning style",
          example: "실습 중심",
        }),
        preferredResources: z.string().openapi({
          description: "Preferred learning resources",
          example: "온라인 강의",
        }),
        mainGoal: z.string().openapi({
          description: "Main learning learningModule",
          example: "웹 개발자 취업",
        }),
        additionalRequirements: z.string().nullable().openapi({
          description: "Additional requirements",
          example: "React, Node.js 포함",
        }),
        createdAt: z.string().openapi({
          description: "Creation timestamp",
          example: "2024-01-01T00:00:00.000Z",
        }),
        updatedAt: z.string().openapi({
          description: "Last update timestamp",
          example: "2024-01-15T10:30:00.000Z",
        }),
      }),
    )
    .openapi({
      description: "List of learningPlans",
    }),
  pagination: z
    .object({
      hasNext: z.boolean().openapi({
        description: "Whether there are more items",
        example: true,
      }),
      nextCursor: z.string().nullable().openapi({
        description: "Cursor for the next page",
        example: "eyJpZCI6MjAsImNyZWF0ZWRBdCI6IjIwMjQtMDEtMDIifQ==",
      }),
      total: z.number().int().openapi({
        description: "Total number of items (if available)",
        example: 150,
      }),
    })
    .openapi({
      description: "Pagination information",
    }),
});

// LearningPlan creation schemas
export const LearningPlanCreateRequestSchema = z.object({
  title: z.string().min(1).max(200).openapi({
    description: "LearningPlan title",
    example: "Full Stack JavaScript Developer",
  }),
  emoji: emojiSchema.optional().openapi({
    description:
      "Emoji that will be used for the learningPlan (fallback applied when omitted)",
    example: "🧠",
  }),
  description: z.string().optional().openapi({
    description: "LearningPlan description",
    example: "Complete guide to becoming a full stack developer",
  }),
  learningTopic: z.string().min(1).max(100).openapi({
    description: "Main learning topic",
    example: "JavaScript",
  }),
  userLevel: z.string().openapi({
    description: "Target user level",
    example: "beginner",
  }),
  targetWeeks: z.number().int().min(1).max(24).openapi({
    description: "Target completion weeks (1-24)",
    example: 12,
  }),
  weeklyHours: z.number().int().min(1).max(60).openapi({
    description: "Weekly study hours (1-60)",
    example: 10,
  }),
  learningStyle: z.string().min(1).max(100).openapi({
    description: "Preferred learning style",
    example: "실습 중심",
  }),
  preferredResources: z.string().min(1).max(100).openapi({
    description: "Preferred learning resources",
    example: "온라인 강의",
  }),
  mainGoal: z.string().min(1).max(200).openapi({
    description: "Main learning learningModule",
    example: "웹 개발자 취업",
  }),
  additionalRequirements: z.string().nullable().openapi({
    description: "Additional requirements",
    example: "React, Node.js 포함",
  }),
});

export const LearningPlanCreateResponseSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the created learningPlan",
    example: "abc123def456",
  }),
  emoji: emojiSchema.openapi({
    description: "Emoji assigned to the learningPlan",
    example: "🧠",
  }),
  title: z.string().openapi({
    description: "LearningPlan title",
    example: "Full Stack JavaScript Developer",
  }),
  description: z.string().nullable().openapi({
    description: "LearningPlan description",
    example: "Complete guide to becoming a full stack developer",
  }),
  status: z.enum(["active", "archived"]).openapi({
    description: "Current status of the learningPlan",
    example: "active",
  }),
  learningTopic: z.string().openapi({
    description: "Main learning topic",
    example: "JavaScript",
  }),
  userLevel: z.string().openapi({
    description: "Target user level",
    example: "beginner",
  }),
  targetWeeks: z.number().int().openapi({
    description: "Target completion weeks",
    example: 12,
  }),
  weeklyHours: z.number().int().openapi({
    description: "Weekly study hours",
    example: 10,
  }),
  learningStyle: z.string().openapi({
    description: "Preferred learning style",
    example: "실습 중심",
  }),
  preferredResources: z.string().openapi({
    description: "Preferred learning resources",
    example: "온라인 강의",
  }),
  mainGoal: z.string().openapi({
    description: "Main learning learningModule",
    example: "웹 개발자 취업",
  }),
  additionalRequirements: z.string().nullable().openapi({
    description: "Additional requirements",
    example: "React, Node.js 포함",
  }),
  createdAt: z.string().openapi({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "Last update timestamp",
    example: "2024-01-01T00:00:00.000Z",
  }),
});

// LearningPlan update schemas
export const LearningPlanUpdateRequestSchema = z.object({
  title: z.string().min(1).max(200).optional().openapi({
    description: "LearningPlan title",
    example: "Full Stack JavaScript Developer",
  }),
  emoji: emojiSchema.optional().openapi({
    description: "Emoji that represents the learningPlan",
    example: "🌱",
  }),
  description: z.string().optional().openapi({
    description: "LearningPlan description",
    example: "Complete guide to becoming a full stack developer",
  }),
  learningTopic: z.string().min(1).max(100).optional().openapi({
    description: "Main learning topic",
    example: "JavaScript",
  }),
  userLevel: z
    .enum(["beginner", "basic", "intermediate", "advanced", "expert"])
    .optional()
    .openapi({
      description: "Target user level",
      example: "beginner",
    }),
  targetWeeks: z.number().int().min(1).max(24).optional().openapi({
    description: "Target completion weeks (1-24)",
    example: 12,
  }),
  weeklyHours: z.number().int().min(1).max(60).optional().openapi({
    description: "Weekly study hours (1-60)",
    example: 10,
  }),
  learningStyle: z.string().min(1).max(100).optional().openapi({
    description: "Preferred learning style",
    example: "실습 중심",
  }),
  preferredResources: z.string().min(1).max(100).optional().openapi({
    description: "Preferred learning resources",
    example: "온라인 강의",
  }),
  mainGoal: z.string().min(1).max(200).optional().openapi({
    description: "Main learning learningModule",
    example: "웹 개발자 취업",
  }),
  additionalRequirements: z.string().nullable().openapi({
    description: "Additional requirements",
    example: "React, Node.js 포함",
  }),
});

export const LearningPlanUpdateResponseSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the learningPlan",
    example: "abc123def456",
  }),
  emoji: emojiSchema.openapi({
    description: "Emoji that represents the learningPlan at a glance",
    example: "🚀",
  }),
  title: z.string().openapi({
    description: "LearningPlan title",
    example: "Full Stack JavaScript Developer",
  }),
  description: z.string().nullable().openapi({
    description: "LearningPlan description",
    example: "Complete guide to becoming a full stack developer",
  }),
  status: z.enum(["active", "archived"]).openapi({
    description: "Current status of the learningPlan",
    example: "active",
  }),
  learningTopic: z.string().openapi({
    description: "Main learning topic",
    example: "JavaScript",
  }),
  userLevel: z.string().openapi({
    description: "Target user level",
    example: "beginner",
  }),
  targetWeeks: z.number().int().openapi({
    description: "Target completion weeks",
    example: 12,
  }),
  weeklyHours: z.number().int().openapi({
    description: "Weekly study hours",
    example: 10,
  }),
  learningStyle: z.string().openapi({
    description: "Preferred learning style",
    example: "실습 중심",
  }),
  preferredResources: z.string().openapi({
    description: "Preferred learning resources",
    example: "온라인 강의",
  }),
  mainGoal: z.string().openapi({
    description: "Main learning learningModule",
    example: "웹 개발자 취업",
  }),
  additionalRequirements: z.string().nullable().openapi({
    description: "Additional requirements",
    example: "React, Node.js 포함",
  }),
  createdAt: z.string().openapi({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "Last update timestamp",
    example: "2024-01-15T10:30:00.000Z",
  }),
});

// LearningPlan status change schemas
export const LearningPlanStatusChangeRequestSchema = z.object({
  status: z.enum(["active", "archived"]).openapi({
    description: "New status for the learningPlan",
    example: "archived",
  }),
});

export const LearningPlanStatusChangeResponseSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the learningPlan",
    example: "abc123def456",
  }),
  status: z.enum(["active", "archived"]).openapi({
    description: "Updated status",
    example: "archived",
  }),
});

// LearningPlan deletion response
export const LearningPlanDeletionResponseSchema = z.object({
  message: z.string().openapi({
    description: "Deletion confirmation message",
    example: "LearningPlan deleted successfully",
  }),
  deletedId: z.string().openapi({
    description: "Public ID of the deleted learningPlan",
    example: "abc123def456",
  }),
});

// Common path parameter schema
export const LearningPlanParamsSchema = z.object({
  learningPlanId: z.string().min(1).openapi({
    description: "Public ID of the learningPlan",
    example: "abc123def456",
  }),
});

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().openapi({
      description: "Error code",
      example: "learningPlan:invalid_pagination_cursor",
    }),
    message: z.string().openapi({
      description: "Error message",
      example: "Invalid pagination cursor provided",
    }),
  }),
});

// ========== Learning Module Schemas ==========

// Learning Module item schema
export const LearningModuleItemSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the learningModule",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  title: z.string().openapi({
    description: "Learning Module title",
    example: "Learn JavaScript Fundamentals",
  }),
  description: z.string().nullable().openapi({
    description: "Learning Module description",
    example: "Master variables, functions, loops, and basic DOM manipulation",
  }),
  order: z.number().int().openapi({
    description: "Display order of the learningModule",
    example: 1,
  }),
  isExpanded: z.boolean().openapi({
    description: "Whether the learning module is expanded in UI",
    example: true,
  }),
  createdAt: z.string().openapi({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "Last update timestamp",
    example: "2024-01-15T10:30:00.000Z",
  }),
  aiNoteStatus: AINoteStatusSchema,
  aiNoteMarkdown: z.string().nullable().openapi({
    description: "AI가 생성한 학습 노트 (마크다운)",
    example: "# 학습 개요\n- 목표 정리...",
  }),
  aiNoteRequestedAt: z.string().datetime().nullable().openapi({
    description: "AI 노트 생성을 요청한 시각",
    example: "2024-06-01T10:00:00.000Z",
  }),
  aiNoteCompletedAt: z.string().datetime().nullable().openapi({
    description: "AI 노트 생성이 완료되거나 실패한 시각",
    example: "2024-06-01T10:05:12.000Z",
  }),
  aiNoteError: z.string().nullable().openapi({
    description: "AI 노트 생성 실패 시 오류 메시지",
    example: "Gemini API 호출이 실패했습니다.",
  }),
});

// Learning Module creation schemas
export const LearningModuleCreateRequestSchema = z.object({
  title: z.string().min(1).max(200).openapi({
    description: "Learning Module title",
    example: "Learn JavaScript Fundamentals",
  }),
  description: z.string().optional().openapi({
    description: "Learning Module description",
    example: "Master variables, functions, loops, and basic DOM manipulation",
  }),
  isExpanded: z.boolean().default(true).openapi({
    description: "Whether the learning module should be expanded by default",
    example: true,
  }),
});

export const LearningModuleCreateResponseSchema = LearningModuleItemSchema;

// Learning Module update schemas
export const LearningModuleUpdateRequestSchema = z.object({
  title: z.string().min(1).max(200).optional().openapi({
    description: "Learning Module title",
    example: "Learn JavaScript Fundamentals",
  }),
  description: z.string().optional().openapi({
    description: "Learning Module description",
    example: "Master variables, functions, loops, and basic DOM manipulation",
  }),
  isExpanded: z.boolean().optional().openapi({
    description: "Whether the learning module is expanded in UI",
    example: true,
  }),
});

export const LearningModuleUpdateResponseSchema = LearningModuleItemSchema;

// Learning Module reorder schema
export const LearningModuleReorderRequestSchema = z.object({
  newOrder: z.number().int().min(1).openapi({
    description: "New order position for the learning module (1-based)",
    example: 3,
  }),
});

export const LearningModuleReorderResponseSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the reordered learningModule",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  order: z.number().int().openapi({
    description: "Updated order position",
    example: 3,
  }),
  updatedAt: z.string().openapi({
    description: "Last update timestamp",
    example: "2024-01-15T10:30:00.000Z",
  }),
});

// Learning Module deletion response
export const LearningModuleDeletionResponseSchema = z.object({
  message: z.string().openapi({
    description: "Deletion confirmation message",
    example: "Learning Module deleted successfully",
  }),
  deletedId: z.string().openapi({
    description: "Public ID of the deleted learningModule",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
});

// Path parameter schemas
export const LearningModuleParamsSchema = z.object({
  learningModuleId: z.string().min(1).openapi({
    description: "Public ID of the learningModule",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
});

export const LearningPlanLearningModuleParamsSchema = z.object({
  learningPlanId: z.string().min(1).openapi({
    description: "Public ID of the learningPlan",
    example: "abc123def456",
  }),
  learningModuleId: z.string().min(1).openapi({
    description: "Public ID of the learningModule",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
});

// ========== LearningTask Schemas ==========

// LearningTask item schema
export const LearningTaskItemSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the learning-task",
    example: "660e8400-e29b-41d4-a716-446655440001",
  }),
  title: z.string().openapi({
    description: "Learning-task title",
    example: "Learn variables and data types",
  }),
  description: z.string().nullable().openapi({
    description: "Learning-task description",
    example:
      "Understand different data types: string, number, boolean, array, object",
  }),
  isCompleted: z.boolean().openapi({
    description: "Whether the learning-task is completed",
    example: false,
  }),
  completedAt: z.iso.datetime().nullable().openapi({
    description: "Timestamp when the learning-task was marked as completed",
    example: "2024-02-15T09:30:00.000Z",
  }),
  dueDate: z.string().nullable().openapi({
    description: "Due date for the learning-task",
    example: "2024-02-15T00:00:00.000Z",
  }),
  memo: z.string().nullable().openapi({
    description: "Personal memo for the learning-task",
    example: "Focus on practice with real examples",
  }),
  order: z.number().int().openapi({
    description: "Display order of the learning-task",
    example: 1,
  }),
  createdAt: z.string().openapi({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "Last update timestamp",
    example: "2024-01-15T10:30:00.000Z",
  }),
  aiNoteStatus: AINoteStatusSchema,
  aiNoteMarkdown: z.string().nullable().openapi({
    description: "AI가 생성한 학습 노트 (마크다운)",
    example: "# 학습 개요\n- 목표 정리...",
  }),
  aiNoteRequestedAt: z.string().datetime().nullable().openapi({
    description: "AI 노트 생성을 요청한 시각",
    example: "2024-06-01T10:00:00.000Z",
  }),
  aiNoteCompletedAt: z.string().datetime().nullable().openapi({
    description: "AI 노트 생성이 완료되거나 실패한 시각",
    example: "2024-06-01T10:05:12.000Z",
  }),
  aiNoteError: z.string().nullable().openapi({
    description: "AI 노트 생성 실패 시 오류 메시지",
    example: "Gemini API 호출이 실패했습니다.",
  }),
});

// LearningTask creation schemas
export const LearningTaskCreateRequestSchema = z.object({
  title: z.string().min(1).max(200).openapi({
    description: "Learning-task title",
    example: "Learn variables and data types",
  }),
  description: z.string().optional().openapi({
    description: "Learning-task description",
    example:
      "Understand different data types: string, number, boolean, array, object",
  }),
  dueDate: z.string().datetime().optional().openapi({
    description: "Due date for the learning-task (ISO 8601 format)",
    example: "2024-02-15T00:00:00.000Z",
  }),
  memo: z.string().optional().openapi({
    description: "Personal memo for the learning-task",
    example: "Focus on practice with real examples",
  }),
});

export const LearningTaskCreateResponseSchema = LearningTaskItemSchema;

// LearningTask update schemas
export const LearningTaskUpdateRequestSchema = z.object({
  title: z.string().min(1).max(200).optional().openapi({
    description: "Learning-task title",
    example: "Learn variables and data types",
  }),
  description: z.string().optional().openapi({
    description: "Learning-task description",
    example:
      "Understand different data types: string, number, boolean, array, object",
  }),
  isCompleted: z.boolean().optional().openapi({
    description: "Whether the learning-task is completed",
    example: true,
  }),
  dueDate: z.string().datetime().nullable().optional().openapi({
    description: "Due date for the learning-task (ISO 8601 format)",
    example: "2024-02-15T00:00:00.000Z",
  }),
  memo: z.string().optional().openapi({
    description: "Personal memo for the learning-task",
    example: "Focus on practice with real examples",
  }),
});

export const LearningTaskUpdateResponseSchema = LearningTaskItemSchema;

// LearningTask detail schema
export const LearningTaskDetailResponseSchema = LearningTaskItemSchema.extend({
  learningModule: z
    .object({
      id: z.string().openapi({
        description: "Public ID of the parent learningModule",
        example: "550e8400-e29b-41d4-a716-446655440000",
      }),
      title: z.string().openapi({
        description: "Title of the parent learningModule",
        example: "Master JavaScript fundamentals",
      }),
      description: z.string().nullable().openapi({
        description: "Description of the parent learningModule",
        example:
          "Focus on core JavaScript knowledge before diving into frameworks",
      }),
      order: z.number().int().openapi({
        description: "Display order of the learningModule",
        example: 1,
      }),
    })
    .openapi({
      description: "Parent learning module metadata",
    }),
  learningPlan: z
    .object({
      id: z.string().openapi({
        description: "Public ID of the learningPlan",
        example: "abc123def456",
      }),
      title: z.string().openapi({
        description: "Title of the learningPlan",
        example: "Full-stack Development LearningPlan",
      }),
    })
    .openapi({
      description: "Parent learningPlan metadata",
    }),
  aiQuiz: GenerateLearningTaskQuizResponseSchema.nullable().openapi({
    description: "가장 최근의 AI 학습 퀴즈 정보",
  }),
});

// LearningTask move schema
export const LearningTaskMoveRequestSchema = z.object({
  newLearningModuleId: z.string().min(1).openapi({
    description:
      "Public ID of the target learning module to move learning-task to",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  newOrder: z.number().int().min(1).optional().openapi({
    description:
      "New order position for the learning-task (1-based). If not provided, will be placed at the end.",
    example: 2,
  }),
});

export const LearningTaskMoveResponseSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the moved learning-task",
    example: "660e8400-e29b-41d4-a716-446655440001",
  }),
  learningModuleId: z.string().openapi({
    description:
      "Public ID of the learning module the learning-task was moved to",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  order: z.number().int().openapi({
    description: "Updated order position",
    example: 2,
  }),
  updatedAt: z.string().openapi({
    description: "Last update timestamp",
    example: "2024-01-15T10:30:00.000Z",
  }),
});

// LearningTask deletion response
export const LearningTaskDeletionResponseSchema = z.object({
  message: z.string().openapi({
    description: "Deletion confirmation message",
    example: "Learning-task deleted successfully",
  }),
  deletedId: z.string().openapi({
    description: "Public ID of the deleted learning-task",
    example: "660e8400-e29b-41d4-a716-446655440001",
  }),
});

// Path parameter schemas
export const LearningTaskParamsSchema = z.object({
  learningTaskId: z.string().min(1).openapi({
    description: "Public ID of the learning-task",
    example: "660e8400-e29b-41d4-a716-446655440001",
  }),
});

export const LearningPlanLearningModuleLearningTaskParamsSchema = z.object({
  learningPlanId: z.string().min(1).openapi({
    description: "Public ID of the learningPlan",
    example: "abc123def456",
  }),
  learningTaskId: z.string().min(1).openapi({
    description: "Public ID of the learning-task",
    example: "660e8400-e29b-41d4-a716-446655440001",
  }),
});

export const LearningPlanLearningModuleLearningTaskQuizParamsSchema =
  LearningPlanLearningModuleLearningTaskParamsSchema.extend({
    quizId: z.string().min(1).openapi({
      description: "AI 퀴즈 ID",
      example: "42",
    }),
  });

// ========== LearningPlan Detail Schema ==========

// LearningPlan with nested learningModules and learning-tasks
export const LearningModuleWithLearningTasksSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the learningModule",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  title: z.string().openapi({
    description: "Learning Module title",
    example: "Learn JavaScript Fundamentals",
  }),
  description: z.string().nullable().openapi({
    description: "Learning Module description",
    example: "Master variables, functions, loops, and basic DOM manipulation",
  }),
  order: z.number().int().openapi({
    description: "Display order of the learningModule",
    example: 1,
  }),
  isExpanded: z.boolean().openapi({
    description: "Whether the learning module is expanded in UI",
    example: true,
  }),
  createdAt: z.string().openapi({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "Last update timestamp",
    example: "2024-01-15T10:30:00.000Z",
  }),
  learningTasks: z.array(LearningTaskItemSchema).openapi({
    description: "List of learning-tasks under this learningModule",
  }),
});

export const LearningPlanDetailResponseSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the learningPlan",
    example: "abc123def456",
  }),
  emoji: emojiSchema.openapi({
    description: "Emoji assigned to the learningPlan",
    example: "🚀",
  }),
  title: z.string().openapi({
    description: "LearningPlan title",
    example: "Full Stack JavaScript Developer",
  }),
  description: z.string().nullable().openapi({
    description: "LearningPlan description",
    example: "Complete guide to becoming a full stack developer",
  }),
  status: z.enum(["active", "archived"]).openapi({
    description: "Current status of the learningPlan",
    example: "active",
  }),
  learningTopic: z.string().openapi({
    description: "Main learning topic",
    example: "JavaScript",
  }),
  userLevel: z.string().openapi({
    description: "Target user level",
    example: "beginner",
  }),
  targetWeeks: z.number().int().openapi({
    description: "Target completion weeks",
    example: 12,
  }),
  weeklyHours: z.number().int().openapi({
    description: "Weekly study hours",
    example: 10,
  }),
  learningStyle: z.string().openapi({
    description: "Preferred learning style",
    example: "실습 중심",
  }),
  preferredResources: z.string().openapi({
    description: "Preferred learning resources",
    example: "온라인 강의",
  }),
  mainGoal: z.string().openapi({
    description: "Main learning learningModule",
    example: "웹 개발자 취업",
  }),
  additionalRequirements: z.string().nullable().openapi({
    description: "Additional requirements",
    example: "React, Node.js 포함",
  }),
  createdAt: z.string().openapi({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "Last update timestamp",
    example: "2024-01-15T10:30:00.000Z",
  }),
  learningModules: z.array(LearningModuleWithLearningTasksSchema).openapi({
    description: "List of learningModules with their learning-tasks",
  }),
  documents: z
    .array(
      DocumentItemSchema.omit({
        storageUrl: true,
      }),
    )
    .openapi({
      description: "List of documents associated with the learningPlan",
    }),
});
