import createClient from "openapi-fetch";

import type { paths } from "./schema";

type LearningPlanCreateBody = NonNullable<
  paths["/learning-plans"]["post"]["requestBody"]
>["content"]["application/json"];
type LearningPlanUpdateBody = NonNullable<
  paths["/learning-plans/{id}"]["patch"]["requestBody"]
>["content"]["application/json"];
type DocumentUploadBody = NonNullable<
  paths["/documents/upload"]["post"]["requestBody"]
>["content"]["multipart/form-data"];

const client = createClient<paths>({
  baseUrl: "http://localhost:3001",
  credentials: "include",
});

const auth = {
  login: async (email: string, password: string) => {
    return client.POST("/auth/login", {
      body: { email, password },
    });
  },

  signup: async (email: string, password: string, name: string) => {
    return client.POST("/auth/signup", {
      body: { email, password, name },
    });
  },

  logout: async () => {
    return client.POST("/auth/logout");
  },

  me: async () => {
    return client.GET("/auth/me");
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return client.PUT("/auth/change-password", {
      body: { currentPassword, newPassword },
    });
  },
};

const learningPlans = {
  list: async (params?: {
    cursor?: string;
    limit?: number;
    search?: string;
    status?: "active" | "archived";
    sort?: "created_at" | "updated_at" | "title";
    order?: "asc" | "desc";
  }) => {
    return client.GET("/learning-plans", {
      params: { query: params },
    });
  },

  detail: async (learningPlanId: string) => {
    return client.GET("/learning-plans/{learningPlanId}", {
      params: { path: { learningPlanId } },
    });
  },

  create: async (data: {
    title: string;
    emoji?: string;
    description?: string;
    learningTopic: string;
    userLevel: "beginner" | "basic" | "intermediate" | "advanced" | "expert";
    targetWeeks: number;
    weeklyHours: number;
    learningStyle: string;
    preferredResources: string;
    mainGoal: string;
    additionalRequirements?: string | null;
  }) => {
    const body: LearningPlanCreateBody = {
      ...data,
      additionalRequirements: data.additionalRequirements ?? null,
    };

    return client.POST("/learning-plans", {
      body,
    });
  },

  update: async (
    learningPlanId: string,
    data: {
      title?: string;
      emoji?: string;
      description?: string;
      learningTopic?: string;
      userLevel?: "beginner" | "basic" | "intermediate" | "advanced" | "expert";
      targetWeeks?: number;
      weeklyHours?: number;
      learningStyle?: string;
      preferredResources?: string;
      mainGoal?: string;
      additionalRequirements?: string | null;
    },
  ) => {
    const body =
      data.additionalRequirements !== undefined
        ? {
            ...data,
            additionalRequirements: data.additionalRequirements,
          }
        : data;

    return client.PATCH("/learning-plans/{id}", {
      params: { path: { learningPlanId } },
      body: body as LearningPlanUpdateBody,
    });
  },

  delete: async (learningPlanId: string) => {
    return client.DELETE("/learning-plans/{id}", {
      params: { path: { learningPlanId } },
    });
  },

  updateStatus: async (
    learningPlanId: string,
    status: "active" | "archived",
  ) => {
    return client.PATCH("/learning-plans/{id}/status", {
      params: { path: { learningPlanId } },
      body: { status },
    });
  },
};

const learningModules = {
  create: async (
    learningPlanId: string,
    data: {
      title: string;
      description?: string;
      isExpanded?: boolean;
    },
  ) => {
    return client.POST("/learning-plans/{learningPlanId}/learning-modules", {
      params: { path: { learningPlanId } },
      body: data,
    });
  },

  update: async (
    learningPlanId: string,
    learningModuleId: string,
    data: {
      title?: string;
      description?: string;
      isExpanded?: boolean;
    },
  ) => {
    return client.PUT(
      "/learning-plans/{learningPlanId}/learning-modules/{learningModuleId}",
      {
        params: { path: { learningPlanId, learningModuleId } },
        body: data,
      },
    );
  },

  delete: async (learningPlanId: string, learningModuleId: string) => {
    return client.DELETE(
      "/learning-plans/{learningPlanId}/learning-modules/{learningModuleId}",
      {
        params: { path: { learningPlanId, learningModuleId } },
      },
    );
  },

  reorder: async (
    learningPlanId: string,
    learningModuleId: string,
    newOrder: number,
  ) => {
    return client.PATCH(
      "/learning-plans/{learningPlanId}/learning-modules/{learningModuleId}/order",
      {
        params: { path: { learningPlanId, learningModuleId } },
        body: { newOrder },
      },
    );
  },
};

const learningTasks = {
  create: async (
    learningPlanId: string,
    learningModuleId: string,
    data: {
      title: string;
      description?: string;
      dueDate?: string;
      memo?: string;
    },
  ) => {
    return client.POST(
      "/learning-plans/{learningPlanId}/learning-modules/{learningModuleId}/learning-tasks",
      {
        params: { path: { learningPlanId, learningModuleId } },
        body: data,
      },
    );
  },

  detail: async (learningPlanId: string, learningTaskId: string) => {
    return client.GET(
      "/learning-plans/{learningPlanId}/learning-tasks/{learningTaskId}",
      {
        params: { path: { learningPlanId, learningTaskId } },
      },
    );
  },

  update: async (
    learningPlanId: string,
    learningTaskId: string,
    data: {
      title?: string;
      description?: string;
      isCompleted?: boolean;
      dueDate?: string | null;
      memo?: string;
    },
  ) => {
    return client.PUT(
      "/learning-plans/{learningPlanId}/learning-tasks/{learningTaskId}",
      {
        params: { path: { learningPlanId, learningTaskId } },
        body: data,
      },
    );
  },

  delete: async (
    learningPlanId: string,
    learningModuleId: string,
    learningTaskId: string,
  ) => {
    return client.DELETE(
      "/learning-plans/{learningPlanId}/learning-modules/{learningModuleId}/learning-tasks/{learningTaskId}",
      {
        params: { path: { learningPlanId, learningModuleId, learningTaskId } },
      },
    );
  },

  move: async (
    learningPlanId: string,
    learningModuleId: string,
    learningTaskId: string,
    data: {
      newLearningModuleId: string;
      newOrder?: number;
    },
  ) => {
    return client.PATCH(
      "/learning-plans/{learningPlanId}/learning-modules/{learningModuleId}/learning-tasks/{learningTaskId}/move",
      {
        params: { path: { learningPlanId, learningModuleId, learningTaskId } },
        body: data,
      },
    );
  },

  submitQuiz: async (
    learningPlanId: string,
    learningTaskId: string,
    quizId: string,
    answers: Array<{ questionId: string; selectedIndex: number }>,
  ) => {
    return client.POST(
      "/learning-plans/{learningPlanId}/learning-tasks/{learningTaskId}/quizzes/{quizId}/submissions",
      {
        params: { path: { learningPlanId, learningTaskId, quizId } },
        body: { answers },
      },
    );
  },
};

const progress = {
  daily: async (params?: { start?: string; end?: string }) => {
    return client.GET("/progress/daily", {
      params: {
        query: params,
      },
    });
  },
};

const documents = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return client.POST("/documents/upload", {
      body: formData as unknown as DocumentUploadBody,
      bodySerializer: () => formData,
    });
  },

  detail: async (publicId: string) => {
    return client.GET("/documents/{publicId}", {
      params: { path: { publicId } },
    });
  },
};

const ai = {
  generateLearningPlan: async (data: {
    documentIds?: Array<string>;
    learningTopic: string;
    userLevel: "초보자" | "기초" | "중급" | "고급" | "전문가";
    targetWeeks: number;
    weeklyHours: number;
    learningStyle:
      | "시각적 학습"
      | "실습 중심"
      | "문서 읽기"
      | "동영상 강의"
      | "대화형 학습"
      | "프로젝트 기반";
    preferredResources:
      | "온라인 강의"
      | "책/전자책"
      | "튜토리얼"
      | "유튜브 영상"
      | "공식 문서"
      | "실습 사이트";
    mainGoal: string;
    additionalRequirements?: string | undefined;
  }) => {
    return client.POST("/ai/learning-plans/generate", {
      body: data,
    });
  },

  generateLearningTaskNote: async (
    learningPlanId: string,
    learningTaskId: string,
    options?: {
      force?: boolean;
    },
  ) => {
    return client.POST(
      "/ai/learning-plans/{learningPlanId}/learning-tasks/{learningTaskId}/notes",
      {
        params: {
          path: { learningPlanId, learningTaskId },
          query:
            options?.force !== undefined
              ? {
                  force: options.force,
                }
              : undefined,
        },
      },
    );
  },

  generateLearningTaskQuiz: async (
    learningPlanId: string,
    learningTaskId: string,
    options?: {
      force?: boolean;
    },
  ) => {
    return client.POST(
      "/ai/learning-plans/{learningPlanId}/learning-tasks/{learningTaskId}/quizzes",
      {
        params: {
          path: { learningPlanId, learningTaskId },
          query:
            options?.force !== undefined
              ? {
                  force: options.force,
                }
              : undefined,
        },
      },
    );
  },
};

export const api = {
  auth,
  learningPlans,
  learningModules,
  learningTasks,
  progress,
  documents,
  ai,
} as const;
