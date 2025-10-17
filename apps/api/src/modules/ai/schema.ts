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
  documentId: z.string().optional().openapi({
    description: "업로드된 PDF 문서의 Public ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
});

export const AINoteStatusSchema = z
  .enum(["idle", "processing", "ready", "failed"])
  .openapi({
    description: "현재 AI 노트 생성 상태",
    example: "processing",
  });

export const SubGoalNoteContentSchema = z
  .object({
    markdown: z.string().min(80).openapi({
      description: "생성된 학습 노트의 마크다운 텍스트",
      example:
        "# 학습 개요\n\n- 목표: React Hooks 이해\n- 예상 소요 시간: 3시간\n\n## 1. 개념 정리\n...",
    }),
  })
  .openapi({
    description: "AI가 생성한 학습 노트 결과",
  });

export const GenerateSubGoalNoteQuerySchema = z
  .object({
    force: z.coerce.boolean().optional().openapi({
      description: "기존 노트가 있더라도 재생성을 강제로 요청합니다",
      example: false,
    }),
  })
  .openapi({
    description: "AI 노트 생성 시 사용되는 쿼리 파라미터",
  });

export const GenerateSubGoalNoteParamsSchema = z
  .object({
    roadmapId: z.string().min(1).openapi({
      description: "로드맵 공개 ID",
      example: "abc123def456",
    }),
    subGoalId: z.string().min(1).openapi({
      description: "세부 목표 공개 ID",
      example: "550e8400-e29b-41d4-a716-446655440000",
    }),
  })
  .openapi({
    description: "AI 노트 생성 대상 세부 목표 식별자",
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
  emoji: z.string().trim().max(16).optional().openapi({
    description: "로드맵을 가장 잘 표현하는 단일 이모지.",
    example: "🚀",
  }),
  goals: z.array(GeneratedGoalSchema).openapi({
    description: "상위 목표들",
  }),
});

export const GenerateSubGoalNoteResponseSchema = z
  .object({
    status: AINoteStatusSchema,
    markdown: z.string().nullable().openapi({
      description: "생성된 마크다운 노트. 생성 중이거나 실패 시 null",
      example: null,
    }),
    requestedAt: z.string().datetime().nullable().openapi({
      description: "가장 최근 노트 생성 요청 시각",
      example: "2024-06-01T10:00:00.000Z",
    }),
    completedAt: z.string().datetime().nullable().openapi({
      description: "생성 완료 혹은 실패가 기록된 시각",
      example: "2024-06-01T10:02:30.000Z",
    }),
    errorMessage: z.string().nullable().openapi({
      description: "실패 시 사용자에게 노출 가능한 오류 메시지",
      example: "Gemini 호출이 실패했습니다. 잠시 후 다시 시도해주세요.",
    }),
  })
  .openapi({
    description: "AI 노트 생성 요청에 대한 상태 응답",
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
  emoji: z.string().openapi({
    description: "로드맵을 대표하는 이모지",
    example: "🚀",
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
