import { z } from "@hono/zod-openapi";

import { ErrorResponseSchema } from "../../common/schema";

const isoDateString = z
  .string()
  .regex(
    /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/u,
    "날짜는 YYYY-MM-DD 형식이어야 합니다.",
  );

export const LearningModuleActivityQuerySchema = z
  .object({
    start: isoDateString.optional().openapi({
      description: "조회 시작 날짜 (YYYY-MM-DD)",
      example: "2024-05-01",
    }),
    end: isoDateString.optional().openapi({
      description: "조회 종료 날짜 (YYYY-MM-DD)",
      example: "2024-05-31",
    }),
  })
  .refine(
    ({ start, end }) => {
      if (!start || !end) {
        return true;
      }
      return start <= end;
    },
    {
      message: "시작 날짜는 종료 날짜보다 늦을 수 없습니다.",
      path: ["start"],
    },
  );

const LearningModuleActivityBaseSchema = z.object({
  learningPlanId: z.string().length(16).openapi({
    description: "로드맵 공개 ID (16자 NanoID)",
    example: "abcdEfghijklmnop",
  }),
  learningPlanTitle: z.string().min(1).openapi({
    description: "로드맵 제목",
    example: "프론트엔드 전환 로드맵",
  }),
  learningModuleId: z.string().uuid().openapi({
    description: "목표 공개 ID (UUID)",
    example: "30aa53ce-93e7-4f90-9f69-6c4de2fb1c5d",
  }),
  learningModuleTitle: z.string().min(1).openapi({
    description: "목표 제목",
    example: "React 기본기 다지기",
  }),
  learningTaskId: z.string().uuid().openapi({
    description: "세부 목표 공개 ID (UUID)",
    example: "f28c26fa-40f8-4f56-9fba-9b8f3d3e2ea7",
  }),
  learningTaskTitle: z.string().min(1).openapi({
    description: "세부 목표 제목",
    example: "Hooks 패턴 정리하기",
  }),
});

const LearningModuleActivityDueSchema = LearningModuleActivityBaseSchema.extend(
  {
    dueDate: z.string().datetime().openapi({
      description: "세부 목표 마감일 (ISO 8601)",
      example: "2024-05-12T00:00:00.000Z",
    }),
  },
);

const LearningModuleActivityCompletedSchema =
  LearningModuleActivityBaseSchema.extend({
    completedAt: z.string().datetime().openapi({
      description: "세부 목표 완료 시각 (ISO 8601)",
      example: "2024-05-14T10:23:45.000Z",
    }),
  });

export const LearningModuleActivityDaySchema = z.object({
  date: isoDateString.openapi({
    description: "활동이 기록된 날짜 (YYYY-MM-DD)",
    example: "2024-05-12",
  }),
  due: z.array(LearningModuleActivityDueSchema).openapi({
    description: "해당 날짜에 마감일이 도래한 세부 목표",
  }),
  completed: z.array(LearningModuleActivityCompletedSchema).openapi({
    description: "해당 날짜에 완료된 세부 목표",
  }),
});

export const LearningModuleActivityResponseSchema = z.object({
  range: z
    .object({
      start: isoDateString.openapi({
        description: "응답 데이터의 시작 날짜",
        example: "2024-05-01",
      }),
      end: isoDateString.openapi({
        description: "응답 데이터의 종료 날짜",
        example: "2024-05-31",
      }),
    })
    .openapi({
      description: "조회 범위 (포함)",
    }),
  items: z.array(LearningModuleActivityDaySchema).openapi({
    description: "날짜별 활동 목록",
  }),
});

export const ProgressSchemas = {
  LearningModuleActivityQuerySchema,
  LearningModuleActivityDaySchema,
  LearningModuleActivityResponseSchema,
  ErrorResponseSchema,
};
