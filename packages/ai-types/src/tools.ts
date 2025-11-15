import { z } from "zod";
/**
 * ============================================================
 * Stored Tool Invocation (데이터베이스 저장용)
 * ============================================================
 */

/**
 * Stored Tool Invocation 스키마
 * Tool call과 result를 결합한 저장 형식
 * 데이터베이스 저장 및 API 전송에 사용됨
 */
export const storedToolInvocationSchema = z.object({
  toolCallId: z.string(),
  toolName: z.string(),
  arguments: z.record(z.string(), z.unknown()),
  result: z.unknown().optional(),
  providerExecuted: z.boolean().optional(),
  error: z.unknown().optional(),
});

/**
 * Stored Tool Invocation 타입
 */
export type StoredToolInvocation = z.infer<typeof storedToolInvocationSchema>;

/**
 * ============================================================
 * Learning Module Tools
 * ============================================================
 */

/**
 * 모듈 생성 도구 입력 스키마
 */
export const createModuleInputSchema = z.object({
  title: z.string().describe("모듈 제목 (예: 'React Hooks 기초')"),
  description: z
    .string()
    .optional()
    .describe("모듈 설명 (예: 'useState, useEffect 학습')"),
});

/**
 * 모듈 수정 도구 입력 스키마
 */
export const updateModuleInputSchema = z.object({
  moduleId: z.string().describe("모듈 Public ID"),
  title: z.string().optional().describe("새 제목"),
  description: z.string().optional().describe("새 설명"),
});

/**
 * 모듈 삭제 도구 입력 스키마
 */
export const deleteModuleInputSchema = z.object({
  moduleId: z.string().describe("삭제할 모듈의 Public ID"),
});

/**
 * 모듈 목록 조회 도구 입력 스키마
 */
export const listModulesInputSchema = z.object({});

/**
 * ============================================================
 * Learning Task Tools
 * ============================================================
 */

/**
 * 태스크 생성 도구 입력 스키마
 */
export const createTaskInputSchema = z.object({
  moduleId: z.string().describe("모듈 Public ID"),
  title: z.string().describe("태스크 제목 (예: 'useState 공식 문서 읽기')"),
  description: z
    .string()
    .optional()
    .describe("태스크 설명 (예: '기본 사용법과 주의사항 파악')"),
  dueDate: z
    .string()
    .optional()
    .describe("마감일 (ISO 8601 형식, 예: '2025-11-20T09:00:00Z')"),
});

/**
 * 태스크 수정 도구 입력 스키마
 */
export const updateTaskInputSchema = z.object({
  taskId: z.string().describe("태스크 Public ID"),
  title: z.string().optional().describe("새 제목"),
  description: z.string().optional().describe("새 설명"),
  isCompleted: z.boolean().optional().describe("완료 여부"),
  dueDate: z
    .string()
    .optional()
    .describe("마감일 (ISO 8601 형식, 예: '2025-11-20T09:00:00Z')"),
  memo: z.string().optional().describe("메모"),
});

/**
 * 태스크 삭제 도구 입력 스키마
 */
export const deleteTaskInputSchema = z.object({
  taskId: z.string().describe("삭제할 태스크의 Public ID"),
});

/**
 * 태스크 완료 처리 도구 입력 스키마
 */
export const completeTasksInputSchema = z.object({
  taskIds: z.array(z.string()).describe("완료 처리할 태스크 ID 배열"),
});

/**
 * 태스크 목록 조회 도구 입력 스키마
 */
export const listTasksInputSchema = z.object({
  moduleId: z.string().describe("모듈 Public ID"),
});

/**
 * 태스크 일괄 수정 도구 입력 스키마
 */
export const bulkUpdateTasksInputSchema = z.object({
  taskIds: z
    .array(z.string())
    .describe("수정할 태스크 Public ID 배열 (최대 100개)"),
  updates: z
    .object({
      title: z.string().optional().describe("모든 태스크에 적용할 새 제목"),
      description: z
        .string()
        .optional()
        .describe("모든 태스크에 적용할 새 설명"),
      isCompleted: z
        .boolean()
        .optional()
        .describe("모든 태스크에 적용할 완료 여부"),
      dueDate: z
        .string()
        .optional()
        .describe(
          "모든 태스크에 적용할 마감일 (ISO 8601 형식, 예: '2025-11-20T09:00:00Z')",
        ),
      memo: z.string().optional().describe("모든 태스크에 적용할 메모"),
    })
    .optional()
    .describe("모든 태스크에 동일하게 적용할 값들"),
  individualUpdates: z
    .array(
      z.object({
        taskId: z.string().describe("태스크 Public ID"),
        updates: z.object({
          title: z.string().optional().describe("새 제목"),
          description: z.string().optional().describe("새 설명"),
          isCompleted: z.boolean().optional().describe("완료 여부"),
          dueDate: z.string().optional().describe("마감일 (ISO 8601 형식)"),
          memo: z.string().optional().describe("메모"),
        }),
      }),
    )
    .optional()
    .describe("각 태스크별로 다르게 적용할 값들 (예: 순차적 마감일 설정)"),
});

/**
 * ============================================================
 * Query Info Tools
 * ============================================================
 */

/**
 * 진도 조회 도구 입력 스키마
 */
export const getProgressInputSchema = z.object({});

/**
 * 학습 계획 상세 조회 도구 입력 스키마
 */
export const getPlanDetailsInputSchema = z.object({});

/**
 * 모듈 상세 조회 도구 입력 스키마
 */
export const getModuleDetailsInputSchema = z.object({
  moduleId: z.string().describe("모듈 Public ID"),
});

/**
 * ============================================================
 * Common Output Schemas
 * ============================================================
 */

/**
 * 공통 성공 응답 스키마 생성 함수
 */
const createSuccessOutputSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

/**
 * 공통 실패 응답 스키마
 */
const failureOutputSchema = z.object({
  success: z.literal(false),
  error: z.string().describe("에러 메시지"),
});

/**
 * 도구 출력 스키마 생성 헬퍼 (성공 또는 실패)
 */
const createToolOutputSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([createSuccessOutputSchema(dataSchema), failureOutputSchema]);

/**
 * ============================================================
 * Learning Module Output Schemas
 * ============================================================
 */

/**
 * 모듈 엔티티 스키마
 */
const moduleEntitySchema = z.object({
  id: z.string().describe("모듈 Public ID"),
  title: z.string().describe("모듈 제목"),
  description: z.string().nullable().describe("모듈 설명"),
  order: z.number().describe("모듈 순서"),
  isExpanded: z.boolean().describe("확장 여부"),
  createdAt: z.string().describe("생성 시각 (ISO 8601 형식)"),
  updatedAt: z.string().describe("수정 시각 (ISO 8601 형식)"),
});

/**
 * 모듈 생성 도구 출력 스키마
 */
export const createModuleOutputSchema =
  createToolOutputSchema(moduleEntitySchema);

/**
 * 모듈 수정 도구 출력 스키마
 */
export const updateModuleOutputSchema =
  createToolOutputSchema(moduleEntitySchema);

/**
 * 모듈 삭제 도구 출력 스키마
 */
export const deleteModuleOutputSchema = createToolOutputSchema(
  z.object({
    deletedId: z.string().describe("삭제된 모듈의 Public ID"),
    message: z.string().describe("삭제 완료 메시지"),
  }),
);

/**
 * 모듈 목록 조회 도구 출력 스키마
 */
export const listModulesOutputSchema = createToolOutputSchema(
  z.array(moduleEntitySchema),
);

/**
 * ============================================================
 * Learning Task Output Schemas
 * ============================================================
 */

/**
 * 태스크 엔티티 스키마
 */
const taskEntitySchema = z.object({
  id: z.string().describe("태스크 Public ID"),
  title: z.string().describe("태스크 제목"),
  description: z.string().nullable().describe("태스크 설명"),
  isCompleted: z.boolean().describe("완료 여부"),
  completedAt: z.string().nullable().describe("완료 시각 (ISO 8601 형식)"),
  dueDate: z.string().nullable().describe("마감일 (ISO 8601 형식)"),
  memo: z.string().nullable().describe("메모"),
  order: z.number().describe("태스크 순서"),
  createdAt: z.string().describe("생성 시각 (ISO 8601 형식)"),
  updatedAt: z.string().describe("수정 시각 (ISO 8601 형식)"),
});

/**
 * 태스크 생성 도구 출력 스키마
 */
export const createTaskOutputSchema = createToolOutputSchema(taskEntitySchema);

/**
 * 태스크 수정 도구 출력 스키마
 */
export const updateTaskOutputSchema = createToolOutputSchema(taskEntitySchema);

/**
 * 태스크 삭제 도구 출력 스키마
 */
export const deleteTaskOutputSchema = createToolOutputSchema(
  z.object({
    deletedId: z.string().describe("삭제된 태스크의 Public ID"),
    message: z.string().describe("삭제 완료 메시지"),
  }),
);

/**
 * 태스크 완료 처리 도구 출력 스키마
 */
export const completeTasksOutputSchema = createToolOutputSchema(
  z.object({
    completedCount: z.number().describe("완료 처리된 태스크 수"),
    totalCount: z.number().describe("전체 요청된 태스크 수"),
    results: z.array(taskEntitySchema).describe("완료 처리된 태스크 목록"),
  }),
);

/**
 * 태스크 목록 조회 도구 출력 스키마
 */
export const listTasksOutputSchema = createToolOutputSchema(
  z.array(taskEntitySchema),
);

/**
 * 태스크 일괄 수정 도구 출력 스키마
 */
export const bulkUpdateTasksOutputSchema = createToolOutputSchema(
  z.object({
    updatedTasks: z.array(taskEntitySchema).describe("수정된 태스크 목록"),
    successCount: z.number().describe("성공한 태스크 수"),
    totalCount: z.number().describe("전체 요청된 태스크 수"),
    message: z.string().describe("결과 메시지"),
  }),
);

/**
 * ============================================================
 * Query Info Output Schemas
 * ============================================================
 */

/**
 * 진도 조회 도구 출력 스키마
 */
export const getProgressOutputSchema = createToolOutputSchema(
  z.object({
    totalTasks: z.number().describe("전체 태스크 수"),
    completedTasks: z.number().describe("완료한 태스크 수"),
    progressPercentage: z.number().describe("진행률 (0-100)"),
    totalModules: z.number().describe("전체 모듈 수"),
  }),
);

/**
 * 간단한 태스크 스키마 (중첩 구조용, 타임스탬프 제외)
 */
const simpleTaskSchema = z.object({
  id: z.string().describe("태스크 Public ID"),
  title: z.string().describe("태스크 제목"),
  description: z.string().nullable().describe("태스크 설명"),
  order: z.number().describe("태스크 순서"),
  isCompleted: z.boolean().describe("완료 여부"),
  completedAt: z.string().nullable().describe("완료 시각 (ISO 8601 형식)"),
  dueDate: z.string().nullable().describe("마감일 (ISO 8601 형식)"),
  memo: z.string().nullable().describe("메모"),
});

/**
 * 모듈 상세 정보 (태스크 포함) 스키마
 */
const moduleWithTasksSchema = z.object({
  id: z.string().describe("모듈 Public ID"),
  title: z.string().describe("모듈 제목"),
  description: z.string().nullable().describe("모듈 설명"),
  order: z.number().describe("모듈 순서"),
  isExpanded: z.boolean().describe("확장 여부"),
  tasks: z.array(simpleTaskSchema).describe("태스크 목록"),
});

/**
 * 학습 계획 상세 조회 도구 출력 스키마
 */
export const getPlanDetailsOutputSchema = createToolOutputSchema(
  z.object({
    id: z.string().describe("학습 계획 Public ID"),
    title: z.string().describe("학습 계획 제목"),
    description: z.string().nullable().describe("학습 계획 설명"),
    emoji: z.string().describe("이모지"),
    learningTopic: z.string().describe("학습 주제"),
    userLevel: z.string().describe("사용자 수준"),
    targetWeeks: z.number().nullable().describe("목표 기간 (주)"),
    weeklyHours: z.number().nullable().describe("주간 학습 시간 (시간)"),
    learningStyle: z.string().nullable().describe("학습 스타일"),
    preferredResources: z.string().nullable().describe("선호 리소스"),
    mainGoal: z.string().nullable().describe("주요 목표"),
    modules: z.array(moduleWithTasksSchema).describe("모듈 목록"),
  }),
);

/**
 * 모듈 상세 조회 도구 출력 스키마
 */
export const getModuleDetailsOutputSchema = createToolOutputSchema(
  moduleWithTasksSchema,
);

/**
 * ============================================================
 * Tool Input Types (Type Inference)
 * ============================================================
 */

export type CreateModuleInput = z.infer<typeof createModuleInputSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleInputSchema>;
export type DeleteModuleInput = z.infer<typeof deleteModuleInputSchema>;
export type ListModulesInput = z.infer<typeof listModulesInputSchema>;

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskInputSchema>;
export type CompleteTasksInput = z.infer<typeof completeTasksInputSchema>;
export type ListTasksInput = z.infer<typeof listTasksInputSchema>;
export type BulkUpdateTasksInput = z.infer<typeof bulkUpdateTasksInputSchema>;

export type GetProgressInput = z.infer<typeof getProgressInputSchema>;
export type GetPlanDetailsInput = z.infer<typeof getPlanDetailsInputSchema>;
export type GetModuleDetailsInput = z.infer<typeof getModuleDetailsInputSchema>;

/**
 * ============================================================
 * Tool Output Types (Type Inference)
 * ============================================================
 */

export type CreateModuleOutput = z.infer<typeof createModuleOutputSchema>;
export type UpdateModuleOutput = z.infer<typeof updateModuleOutputSchema>;
export type DeleteModuleOutput = z.infer<typeof deleteModuleOutputSchema>;
export type ListModulesOutput = z.infer<typeof listModulesOutputSchema>;

export type CreateTaskOutput = z.infer<typeof createTaskOutputSchema>;
export type UpdateTaskOutput = z.infer<typeof updateTaskOutputSchema>;
export type DeleteTaskOutput = z.infer<typeof deleteTaskOutputSchema>;
export type CompleteTasksOutput = z.infer<typeof completeTasksOutputSchema>;
export type ListTasksOutput = z.infer<typeof listTasksOutputSchema>;
export type BulkUpdateTasksOutput = z.infer<typeof bulkUpdateTasksOutputSchema>;

export type GetProgressOutput = z.infer<typeof getProgressOutputSchema>;
export type GetPlanDetailsOutput = z.infer<typeof getPlanDetailsOutputSchema>;
export type GetModuleDetailsOutput = z.infer<
  typeof getModuleDetailsOutputSchema
>;

/**
 * ============================================================
 * All Tools Type Definition
 * ============================================================
 */

/**
 * 모든 AI 도구의 통합 타입
 * AI SDK의 타입 추론에 사용됨
 */
export type AllTools = {
  // Learning Module Tools
  createModule: {
    description: string;
    inputSchema: typeof createModuleInputSchema;
    outputSchema: typeof createModuleOutputSchema;
  };
  updateModule: {
    description: string;
    inputSchema: typeof updateModuleInputSchema;
    outputSchema: typeof updateModuleOutputSchema;
  };
  deleteModule: {
    description: string;
    inputSchema: typeof deleteModuleInputSchema;
    outputSchema: typeof deleteModuleOutputSchema;
  };
  listModules: {
    description: string;
    inputSchema: typeof listModulesInputSchema;
    outputSchema: typeof listModulesOutputSchema;
  };

  // Learning Task Tools
  createTask: {
    description: string;
    inputSchema: typeof createTaskInputSchema;
    outputSchema: typeof createTaskOutputSchema;
  };
  updateTask: {
    description: string;
    inputSchema: typeof updateTaskInputSchema;
    outputSchema: typeof updateTaskOutputSchema;
  };
  deleteTask: {
    description: string;
    inputSchema: typeof deleteTaskInputSchema;
    outputSchema: typeof deleteTaskOutputSchema;
  };
  completeTasks: {
    description: string;
    inputSchema: typeof completeTasksInputSchema;
    outputSchema: typeof completeTasksOutputSchema;
  };
  listTasks: {
    description: string;
    inputSchema: typeof listTasksInputSchema;
    outputSchema: typeof listTasksOutputSchema;
  };
  bulkUpdateTasks: {
    description: string;
    inputSchema: typeof bulkUpdateTasksInputSchema;
    outputSchema: typeof bulkUpdateTasksOutputSchema;
  };

  // Query Info Tools
  getProgress: {
    description: string;
    inputSchema: typeof getProgressInputSchema;
    outputSchema: typeof getProgressOutputSchema;
  };
  getPlanDetails: {
    description: string;
    inputSchema: typeof getPlanDetailsInputSchema;
    outputSchema: typeof getPlanDetailsOutputSchema;
  };
  getModuleDetails: {
    description: string;
    inputSchema: typeof getModuleDetailsInputSchema;
    outputSchema: typeof getModuleDetailsOutputSchema;
  };
};
