import { z } from "@hono/zod-openapi";

// Request schemas
export const GenerateRoadmapRequestSchema = z.object({
  learningTopic: z.string().min(1).openapi({
    description: "학습하고자 하는 주제",
    example: "JavaScript 풀스택 개발",
  }),
  userLevel: z.enum(["초보자", "기초", "중급", "고급", "전문가"]).openapi({
    description: "현재 사용자의 수준",
    example: "초보자",
  }),
  targetWeeks: z.number().int().min(1).max(24).openapi({
    description: "목표 학습 기간 (주)",
    example: 12,
  }),
  weeklyHours: z.number().int().min(1).max(60).openapi({
    description: "주당 학습 시간",
    example: 10,
  }),
  learningStyle: z
    .enum([
      "시각적 학습",
      "실습 중심",
      "문서 읽기",
      "동영상 강의",
      "대화형 학습",
      "프로젝트 기반",
    ])
    .openapi({
      description: "선호하는 학습 스타일",
      example: "실습 중심",
    }),
  preferredResources: z
    .enum([
      "온라인 강의",
      "책/전자책",
      "튜토리얼",
      "유튜브 영상",
      "공식 문서",
      "실습 사이트",
    ])
    .openapi({
      description: "선호하는 학습 자료",
      example: "온라인 강의",
    }),
  mainGoal: z.string().min(1).openapi({
    description: "주요 학습 목표",
    example: "취업을 위한 실무 능력 습득",
  }),
  additionalRequirements: z.string().optional().openapi({
    description: "추가 요구사항",
    example: "React 중심으로 학습하고 싶습니다",
  }),
});

// Response schemas
export const GeneratedSubGoalSchema = z.object({
  title: z.string().openapi({
    description: "하위 목표 제목",
    example: "HTML 기본 태그 학습",
  }),
  description: z.string().openapi({
    description: "하위 목표 설명",
    example:
      "div, span, p, h1-h6 등 기본 HTML 태그들의 용도와 사용법을 익힙니다",
  }),
  order: z.number().int().openapi({
    description: "하위 목표 순서",
    example: 1,
  }),
});

export const GeneratedGoalSchema = z.object({
  title: z.string().openapi({
    description: "상위 목표 제목",
    example: "HTML/CSS 기초",
  }),
  description: z.string().openapi({
    description: "상위 목표 설명",
    example: "웹 개발의 기본이 되는 HTML과 CSS를 학습합니다",
  }),
  order: z.number().int().openapi({
    description: "상위 목표 순서",
    example: 1,
  }),
  subGoals: z.array(GeneratedSubGoalSchema).openapi({
    description: "하위 목표들",
  }),
});

export const GeneratedRoadmapSchema = z.object({
  title: z.string().openapi({
    description: "생성된 로드맵 제목",
    example: "JavaScript 풀스택 개발자 로드맵",
  }),
  description: z.string().openapi({
    description: "로드맵 설명",
    example:
      "12주 만에 JavaScript 풀스택 개발자가 되기 위한 체계적인 학습 계획",
  }),
  goals: z.array(GeneratedGoalSchema).openapi({
    description: "상위 목표들",
  }),
});

// Database roadmap schemas (for saved data response)
export const SavedSubGoalSchema = z.object({
  id: z.string().openapi({
    description: "하위 목표 ID",
    example: "a1b2c3d4e5f6g7h8",
  }),
  title: z.string().openapi({
    description: "하위 목표 제목",
    example: "HTML 기본 태그 학습",
  }),
  description: z.string().nullable().openapi({
    description: "하위 목표 설명",
    example:
      "div, span, p, h1-h6 등 기본 HTML 태그들의 용도와 사용법을 익힙니다",
  }),
  order: z.number().int().openapi({
    description: "하위 목표 순서",
    example: 1,
  }),
  isCompleted: z.boolean().openapi({
    description: "완료 여부",
    example: false,
  }),
  dueDate: z.string().datetime().nullable().optional().openapi({
    description: "마감일",
    example: "2024-12-31T00:00:00Z",
  }),
  memo: z.string().nullable().optional().openapi({
    description: "메모",
    example: "추가 학습 자료 참고",
  }),
});

export const SavedGoalSchema = z.object({
  id: z.string().openapi({
    description: "상위 목표 ID",
    example: "x1y2z3a4b5c6d7e8",
  }),
  title: z.string().openapi({
    description: "상위 목표 제목",
    example: "HTML/CSS 기초",
  }),
  description: z.string().nullable().openapi({
    description: "상위 목표 설명",
    example: "웹 개발의 기본이 되는 HTML과 CSS를 학습합니다",
  }),
  order: z.number().int().openapi({
    description: "상위 목표 순서",
    example: 1,
  }),
  isExpanded: z.boolean().openapi({
    description: "펼침 여부",
    example: true,
  }),
  subGoals: z.array(SavedSubGoalSchema).openapi({
    description: "하위 목표들",
  }),
});

export const SavedRoadmapSchema = z.object({
  id: z.string().openapi({
    description: "로드맵 공개 ID",
    example: "abc123def456ghi7",
  }),
  title: z.string().openapi({
    description: "로드맵 제목",
    example: "JavaScript 풀스택 개발자 로드맵",
  }),
  description: z.string().nullable().openapi({
    description: "로드맵 설명",
    example:
      "12주 만에 JavaScript 풀스택 개발자가 되기 위한 체계적인 학습 계획",
  }),
  status: z.string().openapi({
    description: "로드맵 상태",
    example: "active",
  }),
  // 개인화 정보 포함
  learningTopic: z.string().openapi({
    description: "학습 주제",
    example: "JavaScript 풀스택 개발",
  }),
  userLevel: z.string().openapi({
    description: "사용자 수준",
    example: "초보자",
  }),
  targetWeeks: z.number().int().openapi({
    description: "목표 기간 (주)",
    example: 12,
  }),
  weeklyHours: z.number().int().openapi({
    description: "주당 학습 시간",
    example: 10,
  }),
  learningStyle: z.string().openapi({
    description: "학습 스타일",
    example: "실습 중심",
  }),
  preferredResources: z.string().openapi({
    description: "선호 자료",
    example: "온라인 강의",
  }),
  mainGoal: z.string().openapi({
    description: "주요 목표",
    example: "취업을 위한 실무 능력 습득",
  }),
  additionalRequirements: z.string().optional().openapi({
    description: "추가 요구사항",
    example: "React 중심으로 학습하고 싶습니다",
  }),
  goals: z.array(SavedGoalSchema).openapi({
    description: "상위 목표들",
  }),
  createdAt: z.string().datetime().openapi({
    description: "생성일",
    example: "2024-01-01T00:00:00Z",
  }),
  updatedAt: z.string().datetime().openapi({
    description: "수정일",
    example: "2024-01-01T00:00:00Z",
  }),
});

export const GenerateRoadmapResponseSchema = z.object({
  roadmap: SavedRoadmapSchema,
  message: z.string().openapi({
    description: "생성 완료 메시지",
    example: "로드맵이 성공적으로 생성되었습니다.",
  }),
});

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().openapi({
      description: "에러 코드",
      example: "ai:generation_failed",
    }),
    message: z.string().openapi({
      description: "에러 메시지",
      example: "로드맵 생성에 실패했습니다.",
    }),
  }),
});
