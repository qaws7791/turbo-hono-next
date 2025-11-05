import { z } from "@hono/zod-openapi";

import { ErrorResponseSchema } from "../../common/schema";
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
    description: "페이지네이션 커서(인코딩된 문자열)",
    example: "eyJpZCI6MTIsImNyZWF0ZWRBdCI6IjIwMjQtMDEtMDEifQ==",
  }),
  limit: z.coerce.number().int().min(1).max(100).default(20).openapi({
    description: "반환할 항목 수",
    example: 20,
  }),
  search: z.string().optional().openapi({
    description: "제목 또는 설명 검색어",
    example: "JavaScript learning",
  }),
  status: z.enum(["active", "archived"]).optional().openapi({
    description: "LearningPlan 상태 필터",
    example: "active",
  }),
  sort: z
    .enum(["created_at", "updated_at", "title"])
    .default("created_at")
    .openapi({
      description: "정렬 기준 필드",
      example: "created_at",
    }),
  order: z.enum(["asc", "desc"]).default("desc").openapi({
    description: "정렬 순서",
    example: "desc",
  }),
});

// Response schemas
export const LearningPlanItemSchema = z.object({
  id: z.string().openapi({
    description: "LearningPlan 공개 ID",
    example: "abc123def456",
  }),
  emoji: emojiSchema.openapi({
    description: "LearningPlan을 한눈에 나타내는 이모지",
    example: "🚀",
  }),
  title: z.string().openapi({
    description: "LearningPlan 제목",
    example: "Full Stack JavaScript Developer",
  }),
  description: z.string().nullable().openapi({
    description: "LearningPlan 설명",
    example: "Complete guide to becoming a full stack developer",
  }),
  status: z.enum(["active", "archived"]).openapi({
    description: "LearningPlan 현재 상태",
    example: "active",
  }),
  learningModuleCompletionPercent: z.number().int().min(0).max(100).openapi({
    description: "완료된 LearningTask 비율(0-100)",
    example: 75,
  }),
  learningTopic: z.string().openapi({
    description: "핵심 학습 주제",
    example: "JavaScript",
  }),
  userLevel: z.string().openapi({
    description: "대상 학습자 수준",
    example: "beginner",
  }),
  targetWeeks: z.number().int().openapi({
    description: "목표 완료 주차",
    example: 12,
  }),
  weeklyHours: z.number().int().openapi({
    description: "주간 학습 시간",
    example: 10,
  }),
  learningStyle: z.string().openapi({
    description: "선호 학습 방식",
    example: "실습 중심",
  }),
  preferredResources: z.string().openapi({
    description: "선호 학습 자료",
    example: "온라인 강의",
  }),
  mainGoal: z.string().openapi({
    description: "주요 학습 목표",
    example: "웹 개발자 취업",
  }),
  additionalRequirements: z.string().nullable().openapi({
    description: "추가 요구 사항",
    example: "React, Node.js 포함",
  }),
  createdAt: z.string().openapi({
    description: "생성 시각",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "마지막 수정 시각",
    example: "2024-01-15T10:30:00.000Z",
  }),
});

export const LearningPlanListResponseSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().openapi({
          description: "LearningPlan 공개 ID",
          example: "abc123def456",
        }),

        emoji: emojiSchema.openapi({
          description: "LearningPlan을 한눈에 나타내는 이모지",
          example: "🚀",
        }),
        title: z.string().openapi({
          description: "LearningPlan 제목",
          example: "Full Stack JavaScript Developer",
        }),
        description: z.string().nullable().openapi({
          description: "LearningPlan 설명",
          example: "Complete guide to becoming a full stack developer",
        }),
        status: z.enum(["active", "archived"]).openapi({
          description: "LearningPlan 현재 상태",
          example: "active",
        }),
        learningModuleCompletionPercent: z
          .number()
          .int()
          .min(0)
          .max(100)
          .openapi({
            description: "완료된 LearningTask 비율(0-100)",
            example: 75,
          }),
        learningTopic: z.string().openapi({
          description: "핵심 학습 주제",
          example: "JavaScript",
        }),
        userLevel: z.string().openapi({
          description: "대상 학습자 수준",
          example: "beginner",
        }),
        targetWeeks: z.number().int().openapi({
          description: "목표 완료 주차",
          example: 12,
        }),
        weeklyHours: z.number().int().openapi({
          description: "주간 학습 시간",
          example: 10,
        }),
        learningStyle: z.string().openapi({
          description: "선호 학습 방식",
          example: "실습 중심",
        }),
        preferredResources: z.string().openapi({
          description: "선호 학습 자료",
          example: "온라인 강의",
        }),
        mainGoal: z.string().openapi({
          description: "주요 학습 목표",
          example: "웹 개발자 취업",
        }),
        additionalRequirements: z.string().nullable().openapi({
          description: "추가 요구 사항",
          example: "React, Node.js 포함",
        }),
        createdAt: z.string().openapi({
          description: "생성 시각",
          example: "2024-01-01T00:00:00.000Z",
        }),
        updatedAt: z.string().openapi({
          description: "마지막 수정 시각",
          example: "2024-01-15T10:30:00.000Z",
        }),
      }),
    )
    .openapi({
      description: "LearningPlan 목록",
    }),
  pagination: z
    .object({
      hasNext: z.boolean().openapi({
        description: "추가 항목 존재 여부",
        example: true,
      }),
      nextCursor: z.string().nullable().openapi({
        description: "다음 페이지 커서",
        example: "eyJpZCI6MjAsImNyZWF0ZWRBdCI6IjIwMjQtMDEtMDIifQ==",
      }),
    })
    .openapi({
      description: "페이지네이션 정보",
    }),
});

// LearningPlan creation schemas
export const LearningPlanCreateRequestSchema = z.object({
  title: z.string().min(1).max(200).openapi({
    description: "LearningPlan 제목",
    example: "Full Stack JavaScript Developer",
  }),
  emoji: emojiSchema.optional().openapi({
    description: "LearningPlan에 사용할 이모지(미입력 시 기본값 적용)",
    example: "🧠",
  }),
  description: z.string().optional().openapi({
    description: "LearningPlan 설명",
    example: "Complete guide to becoming a full stack developer",
  }),
  learningTopic: z.string().min(1).max(100).openapi({
    description: "핵심 학습 주제",
    example: "JavaScript",
  }),
  userLevel: z.string().openapi({
    description: "대상 학습자 수준",
    example: "beginner",
  }),
  targetWeeks: z.number().int().min(1).max(24).openapi({
    description: "목표 완료 주차(1-24주)",
    example: 12,
  }),
  weeklyHours: z.number().int().min(1).max(60).openapi({
    description: "주간 학습 시간(1-60시간)",
    example: 10,
  }),
  learningStyle: z.string().min(1).max(100).openapi({
    description: "선호 학습 방식",
    example: "실습 중심",
  }),
  preferredResources: z.string().min(1).max(100).openapi({
    description: "선호 학습 자료",
    example: "온라인 강의",
  }),
  mainGoal: z.string().min(1).max(200).openapi({
    description: "주요 학습 목표",
    example: "웹 개발자 취업",
  }),
  additionalRequirements: z.string().nullable().openapi({
    description: "추가 요구 사항",
    example: "React, Node.js 포함",
  }),
});

export const LearningPlanCreateResponseSchema = z.object({
  id: z.string().openapi({
    description: "생성된 LearningPlan 공개 ID",
    example: "abc123def456",
  }),
  emoji: emojiSchema.openapi({
    description: "LearningPlan에 지정된 이모지",
    example: "🧠",
  }),
  title: z.string().openapi({
    description: "LearningPlan 제목",
    example: "Full Stack JavaScript Developer",
  }),
  description: z.string().nullable().openapi({
    description: "LearningPlan 설명",
    example: "Complete guide to becoming a full stack developer",
  }),
  status: z.enum(["active", "archived"]).openapi({
    description: "LearningPlan 현재 상태",
    example: "active",
  }),
  learningTopic: z.string().openapi({
    description: "핵심 학습 주제",
    example: "JavaScript",
  }),
  userLevel: z.string().openapi({
    description: "대상 학습자 수준",
    example: "beginner",
  }),
  targetWeeks: z.number().int().openapi({
    description: "목표 완료 주차",
    example: 12,
  }),
  weeklyHours: z.number().int().openapi({
    description: "주간 학습 시간",
    example: 10,
  }),
  learningStyle: z.string().openapi({
    description: "선호 학습 방식",
    example: "실습 중심",
  }),
  preferredResources: z.string().openapi({
    description: "선호 학습 자료",
    example: "온라인 강의",
  }),
  mainGoal: z.string().openapi({
    description: "주요 학습 목표",
    example: "웹 개발자 취업",
  }),
  additionalRequirements: z.string().nullable().openapi({
    description: "추가 요구 사항",
    example: "React, Node.js 포함",
  }),
  createdAt: z.string().openapi({
    description: "생성 시각",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "마지막 수정 시각",
    example: "2024-01-01T00:00:00.000Z",
  }),
});

// LearningPlan update schemas
export const LearningPlanUpdateRequestSchema = z.object({
  title: z.string().min(1).max(200).optional().openapi({
    description: "LearningPlan 제목",
    example: "Full Stack JavaScript Developer",
  }),
  emoji: emojiSchema.optional().openapi({
    description: "LearningPlan을 나타내는 이모지",
    example: "🌱",
  }),
  description: z.string().optional().openapi({
    description: "LearningPlan 설명",
    example: "Complete guide to becoming a full stack developer",
  }),
  learningTopic: z.string().min(1).max(100).optional().openapi({
    description: "핵심 학습 주제",
    example: "JavaScript",
  }),
  userLevel: z
    .enum(["beginner", "basic", "intermediate", "advanced", "expert"])
    .optional()
    .openapi({
      description: "대상 학습자 수준",
      example: "beginner",
    }),
  targetWeeks: z.number().int().min(1).max(24).optional().openapi({
    description: "목표 완료 주차(1-24주)",
    example: 12,
  }),
  weeklyHours: z.number().int().min(1).max(60).optional().openapi({
    description: "주간 학습 시간(1-60시간)",
    example: 10,
  }),
  learningStyle: z.string().min(1).max(100).optional().openapi({
    description: "선호 학습 방식",
    example: "실습 중심",
  }),
  preferredResources: z.string().min(1).max(100).optional().openapi({
    description: "선호 학습 자료",
    example: "온라인 강의",
  }),
  mainGoal: z.string().min(1).max(200).optional().openapi({
    description: "주요 학습 목표",
    example: "웹 개발자 취업",
  }),
  additionalRequirements: z.string().nullable().openapi({
    description: "추가 요구 사항",
    example: "React, Node.js 포함",
  }),
});

export const LearningPlanUpdateResponseSchema = z.object({
  id: z.string().openapi({
    description: "LearningPlan 공개 ID",
    example: "abc123def456",
  }),
  emoji: emojiSchema.openapi({
    description: "LearningPlan을 한눈에 나타내는 이모지",
    example: "🚀",
  }),
  title: z.string().openapi({
    description: "LearningPlan 제목",
    example: "Full Stack JavaScript Developer",
  }),
  description: z.string().nullable().openapi({
    description: "LearningPlan 설명",
    example: "Complete guide to becoming a full stack developer",
  }),
  status: z.enum(["active", "archived"]).openapi({
    description: "LearningPlan 현재 상태",
    example: "active",
  }),
  learningTopic: z.string().openapi({
    description: "핵심 학습 주제",
    example: "JavaScript",
  }),
  userLevel: z.string().openapi({
    description: "대상 학습자 수준",
    example: "beginner",
  }),
  targetWeeks: z.number().int().openapi({
    description: "목표 완료 주차",
    example: 12,
  }),
  weeklyHours: z.number().int().openapi({
    description: "주간 학습 시간",
    example: 10,
  }),
  learningStyle: z.string().openapi({
    description: "선호 학습 방식",
    example: "실습 중심",
  }),
  preferredResources: z.string().openapi({
    description: "선호 학습 자료",
    example: "온라인 강의",
  }),
  mainGoal: z.string().openapi({
    description: "주요 학습 목표",
    example: "웹 개발자 취업",
  }),
  additionalRequirements: z.string().nullable().openapi({
    description: "추가 요구 사항",
    example: "React, Node.js 포함",
  }),
  createdAt: z.string().openapi({
    description: "생성 시각",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "마지막 수정 시각",
    example: "2024-01-15T10:30:00.000Z",
  }),
});

// LearningPlan status change schemas
export const LearningPlanStatusChangeRequestSchema = z.object({
  status: z.enum(["active", "archived"]).openapi({
    description: "변경할 LearningPlan 상태",
    example: "archived",
  }),
});

export const LearningPlanStatusChangeResponseSchema = z.object({
  id: z.string().openapi({
    description: "LearningPlan 공개 ID",
    example: "abc123def456",
  }),
  status: z.enum(["active", "archived"]).openapi({
    description: "변경된 상태",
    example: "archived",
  }),
});

// LearningPlan deletion response
export const LearningPlanDeletionResponseSchema = z.object({
  message: z.string().openapi({
    description: "삭제 완료 메시지",
    example: "LearningPlan을 삭제했습니다.",
  }),
  deletedId: z.string().openapi({
    description: "삭제된 LearningPlan 공개 ID",
    example: "abc123def456",
  }),
});

// Common path parameter schema
export const LearningPlanParamsSchema = z.object({
  id: z.string().min(1).openapi({
    description: "LearningPlan 공개 ID",
    example: "abc123def456",
  }),
});

// ========== Learning Module Schemas ==========

// Learning Module item schema
export const LearningModuleItemSchema = z.object({
  id: z.string().openapi({
    description: "LearningModule 공개 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  title: z.string().openapi({
    description: "LearningModule 제목",
    example: "Learn JavaScript Fundamentals",
  }),
  description: z.string().nullable().openapi({
    description: "LearningModule 설명",
    example: "Master variables, functions, loops, and basic DOM manipulation",
  }),
  order: z.number().int().openapi({
    description: "LearningModule 표시 순서",
    example: 1,
  }),
  isExpanded: z.boolean().openapi({
    description: "UI에서 LearningModule이 펼쳐져 있는지 여부",
    example: true,
  }),
  createdAt: z.string().openapi({
    description: "생성 시각",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "마지막 수정 시각",
    example: "2024-01-15T10:30:00.000Z",
  }),
});

// Learning Module creation schemas
export const LearningModuleCreateRequestSchema = z.object({
  title: z.string().min(1).max(200).openapi({
    description: "LearningModule 제목",
    example: "Learn JavaScript Fundamentals",
  }),
  description: z.string().optional().openapi({
    description: "LearningModule 설명",
    example: "Master variables, functions, loops, and basic DOM manipulation",
  }),
  isExpanded: z.boolean().default(true).openapi({
    description: "기본으로 LearningModule을 펼칠지 여부",
    example: true,
  }),
});

export const LearningModuleCreateResponseSchema = LearningModuleItemSchema;

// Learning Module update schemas
export const LearningModuleUpdateRequestSchema = z.object({
  title: z.string().min(1).max(200).optional().openapi({
    description: "LearningModule 제목",
    example: "Learn JavaScript Fundamentals",
  }),
  description: z.string().optional().openapi({
    description: "LearningModule 설명",
    example: "Master variables, functions, loops, and basic DOM manipulation",
  }),
  isExpanded: z.boolean().optional().openapi({
    description: "UI에서 LearningModule이 펼쳐져 있는지 여부",
    example: true,
  }),
});

export const LearningModuleUpdateResponseSchema = LearningModuleItemSchema;

// Learning Module reorder schema
export const LearningModuleReorderRequestSchema = z.object({
  newOrder: z.number().int().min(1).openapi({
    description: "LearningModule의 새로운 순서(1부터 시작)",
    example: 3,
  }),
});

export const LearningModuleReorderResponseSchema = z.object({
  id: z.string().openapi({
    description: "순서가 변경된 LearningModule 공개 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  order: z.number().int().openapi({
    description: "변경된 순서",
    example: 3,
  }),
  updatedAt: z.string().openapi({
    description: "마지막 수정 시각",
    example: "2024-01-15T10:30:00.000Z",
  }),
});

// Learning Module deletion response
export const LearningModuleDeletionResponseSchema = z.object({
  message: z.string().openapi({
    description: "삭제 완료 메시지",
    example: "LearningModule을 삭제했습니다.",
  }),
  deletedId: z.string().openapi({
    description: "삭제된 LearningModule 공개 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
});

// Path parameter schemas
export const LearningModuleParamsSchema = z.object({
  id: z.string().min(1).openapi({
    description: "LearningModule 공개 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
});

export const LearningPlanLearningModuleParamsSchema = z.object({
  learningPlanId: z.string().min(1).openapi({
    description: "LearningPlan 공개 ID",
    example: "abc123def456",
  }),
  learningModuleId: z.string().min(1).openapi({
    description: "LearningModule 공개 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
});

// ========== LearningTask Schemas ==========

// LearningTask item schema
export const LearningTaskItemSchema = z.object({
  id: z.string().openapi({
    description: "LearningTask 공개 ID",
    example: "660e8400-e29b-41d4-a716-446655440001",
  }),
  title: z.string().openapi({
    description: "LearningTask 제목",
    example: "Learn variables and data types",
  }),
  description: z.string().nullable().openapi({
    description: "LearningTask 설명",
    example:
      "Understand different data types: string, number, boolean, array, object",
  }),
  isCompleted: z.boolean().openapi({
    description: "LearningTask 완료 여부",
    example: false,
  }),
  completedAt: z.iso.datetime().nullable().openapi({
    description: "LearningTask 완료 시각",
    example: "2024-02-15T09:30:00.000Z",
  }),
  dueDate: z.string().nullable().openapi({
    description: "LearningTask 마감일",
    example: "2024-02-15T00:00:00.000Z",
  }),
  memo: z.string().nullable().openapi({
    description: "LearningTask 메모",
    example: "Focus on practice with real examples",
  }),
  order: z.number().int().openapi({
    description: "LearningTask 표시 순서",
    example: 1,
  }),
  createdAt: z.string().openapi({
    description: "생성 시각",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "마지막 수정 시각",
    example: "2024-01-15T10:30:00.000Z",
  }),
});

// LearningTask creation schemas
export const LearningTaskCreateRequestSchema = z.object({
  learningModuleId: z.string().min(1).openapi({
    description: "상위 LearningModule 공개 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  title: z.string().min(1).max(200).openapi({
    description: "LearningTask 제목",
    example: "Learn variables and data types",
  }),
  description: z.string().optional().openapi({
    description: "LearningTask 설명",
    example:
      "Understand different data types: string, number, boolean, array, object",
  }),
  dueDate: z.string().datetime().optional().openapi({
    description: "LearningTask 마감일(ISO 8601 형식)",
    example: "2024-02-15T00:00:00.000Z",
  }),
  memo: z.string().optional().openapi({
    description: "LearningTask 메모",
    example: "Focus on practice with real examples",
  }),
});

export const LearningTaskCreateResponseSchema = LearningTaskItemSchema;

// LearningTask update schemas
export const LearningTaskUpdateRequestSchema = z.object({
  title: z.string().min(1).max(200).optional().openapi({
    description: "LearningTask 제목",
    example: "Learn variables and data types",
  }),
  description: z.string().optional().openapi({
    description: "LearningTask 설명",
    example:
      "Understand different data types: string, number, boolean, array, object",
  }),
  isCompleted: z.boolean().optional().openapi({
    description: "LearningTask 완료 여부",
    example: true,
  }),
  dueDate: z.string().datetime().nullable().optional().openapi({
    description: "LearningTask 마감일(ISO 8601 형식)",
    example: "2024-02-15T00:00:00.000Z",
  }),
  memo: z.string().optional().openapi({
    description: "LearningTask 메모",
    example: "Focus on practice with real examples",
  }),
});

export const LearningTaskUpdateResponseSchema = LearningTaskItemSchema;

// LearningTask detail schema
export const LearningTaskDetailResponseSchema = LearningTaskItemSchema.extend({
  learningModule: z
    .object({
      id: z.string().openapi({
        description: "상위 LearningModule 공개 ID",
        example: "550e8400-e29b-41d4-a716-446655440000",
      }),
      title: z.string().openapi({
        description: "상위 LearningModule 제목",
        example: "Master JavaScript fundamentals",
      }),
      description: z.string().nullable().openapi({
        description: "상위 LearningModule 설명",
        example:
          "Focus on core JavaScript knowledge before diving into frameworks",
      }),
      order: z.number().int().openapi({
        description: "LearningModule 표시 순서",
        example: 1,
      }),
    })
    .openapi({
      description: "상위 LearningModule 메타데이터",
    }),
  learningPlan: z
    .object({
      id: z.string().openapi({
        description: "LearningPlan 공개 ID",
        example: "abc123def456",
      }),
      title: z.string().openapi({
        description: "LearningPlan 제목",
        example: "Full-stack Development LearningPlan",
      }),
    })
    .openapi({
      description: "상위 LearningPlan 메타데이터",
    }),
});

// LearningTask move schema
export const LearningTaskMoveRequestSchema = z.object({
  newLearningModuleId: z.string().min(1).openapi({
    description: "LearningTask를 이동할 대상 LearningModule 공개 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  newOrder: z.number().int().min(1).optional().openapi({
    description:
      "LearningTask의 새로운 순서(1부터 시작). 값을 생략하면 마지막에 배치됩니다.",
    example: 2,
  }),
});

export const LearningTaskMoveResponseSchema = z.object({
  id: z.string().openapi({
    description: "이동된 LearningTask 공개 ID",
    example: "660e8400-e29b-41d4-a716-446655440001",
  }),
  learningModuleId: z.string().openapi({
    description: "LearningTask가 이동된 LearningModule 공개 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  order: z.number().int().openapi({
    description: "변경된 순서",
    example: 2,
  }),
  updatedAt: z.string().openapi({
    description: "마지막 수정 시각",
    example: "2024-01-15T10:30:00.000Z",
  }),
});

// LearningTask deletion response
export const LearningTaskDeletionResponseSchema = z.object({
  message: z.string().openapi({
    description: "삭제 완료 메시지",
    example: "LearningTask를 삭제했습니다.",
  }),
  deletedId: z.string().openapi({
    description: "삭제된 LearningTask 공개 ID",
    example: "660e8400-e29b-41d4-a716-446655440001",
  }),
});

// Path parameter schemas
export const LearningTaskParamsSchema = z.object({
  id: z.string().min(1).openapi({
    description: "LearningTask 공개 ID",
    example: "660e8400-e29b-41d4-a716-446655440001",
  }),
});

export const LearningTaskQuizParamsSchema = z.object({
  id: z.string().min(1).openapi({
    description: "LearningTask Quiz 공개 ID",
    example: "42",
  }),
});

export const LearningPlanLearningModuleLearningTaskParamsSchema = z.object({
  learningPlanId: z.string().min(1).openapi({
    description: "LearningPlan 공개 ID",
    example: "abc123def456",
  }),
  learningModuleId: z.string().min(1).openapi({
    description: "LearningModule 공개 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  learningTaskId: z.string().min(1).openapi({
    description: "LearningTask 공개 ID",
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
    description: "LearningModule 공개 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  title: z.string().openapi({
    description: "LearningModule 제목",
    example: "Learn JavaScript Fundamentals",
  }),
  description: z.string().nullable().openapi({
    description: "LearningModule 설명",
    example: "Master variables, functions, loops, and basic DOM manipulation",
  }),
  order: z.number().int().openapi({
    description: "LearningModule 표시 순서",
    example: 1,
  }),
  isExpanded: z.boolean().openapi({
    description: "UI에서 LearningModule이 펼쳐져 있는지 여부",
    example: true,
  }),
  createdAt: z.string().openapi({
    description: "생성 시각",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "마지막 수정 시각",
    example: "2024-01-15T10:30:00.000Z",
  }),
  learningTasks: z.array(LearningTaskItemSchema).openapi({
    description: "이 LearningModule에 속한 LearningTask 목록",
  }),
});

export const LearningPlanDetailResponseSchema = z.object({
  id: z.string().openapi({
    description: "LearningPlan 공개 ID",
    example: "abc123def456",
  }),
  emoji: emojiSchema.openapi({
    description: "LearningPlan에 지정된 이모지",
    example: "🚀",
  }),
  title: z.string().openapi({
    description: "LearningPlan 제목",
    example: "Full Stack JavaScript Developer",
  }),
  description: z.string().nullable().openapi({
    description: "LearningPlan 설명",
    example: "Complete guide to becoming a full stack developer",
  }),
  status: z.enum(["active", "archived"]).openapi({
    description: "LearningPlan 현재 상태",
    example: "active",
  }),
  learningTopic: z.string().openapi({
    description: "핵심 학습 주제",
    example: "JavaScript",
  }),
  userLevel: z.string().openapi({
    description: "대상 학습자 수준",
    example: "beginner",
  }),
  targetWeeks: z.number().int().openapi({
    description: "목표 완료 주차",
    example: 12,
  }),
  weeklyHours: z.number().int().openapi({
    description: "주간 학습 시간",
    example: 10,
  }),
  learningStyle: z.string().openapi({
    description: "선호 학습 방식",
    example: "실습 중심",
  }),
  preferredResources: z.string().openapi({
    description: "선호 학습 자료",
    example: "온라인 강의",
  }),
  mainGoal: z.string().openapi({
    description: "주요 학습 목표",
    example: "웹 개발자 취업",
  }),
  additionalRequirements: z.string().nullable().openapi({
    description: "추가 요구 사항",
    example: "React, Node.js 포함",
  }),
  createdAt: z.string().openapi({
    description: "생성 시각",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "마지막 수정 시각",
    example: "2024-01-15T10:30:00.000Z",
  }),
  learningModules: z.array(LearningModuleWithLearningTasksSchema).openapi({
    description: "LearningModule과 포함된 LearningTask 목록",
  }),
  documents: z
    .array(
      DocumentItemSchema.omit({
        storageUrl: true,
      }),
    )
    .openapi({
      description: "LearningPlan과 연결된 문서 목록",
    }),
});

// Re-export common schemas for convenience
export { ErrorResponseSchema };
