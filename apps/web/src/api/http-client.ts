import createClient from "openapi-fetch";

import type { paths } from "./schema";

type LearningPlanCreateBody = NonNullable<
  paths["/plans"]["post"]["requestBody"]
>["content"]["application/json"];
type LearningPlanUpdateBody = NonNullable<
  paths["/plans/{id}"]["patch"]["requestBody"]
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
    return client.GET("/plans", {
      params: { query: params },
    });
  },

  detail: async (id: string) => {
    return client.GET("/plans/{id}", {
      params: { path: { id } },
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

    return client.POST("/plans", {
      body,
    });
  },

  update: async (
    id: string,
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

    return client.PATCH("/plans/{id}", {
      params: { path: { id } },
      body: body as LearningPlanUpdateBody,
    });
  },

  delete: async (id: string) => {
    return client.DELETE("/plans/{id}", {
      params: { path: { id } },
    });
  },

  updateStatus: async (id: string, status: "active" | "archived") => {
    return client.PATCH("/plans/{id}/status", {
      params: { path: { id } },
      body: { status },
    });
  },
};

const learningModules = {
  create: async (
    planId: string,
    data: {
      title: string;
      description?: string;
      isExpanded?: boolean;
    },
  ) => {
    return client.POST("/plans/{id}/modules", {
      params: { path: { id: planId } },
      body: data,
    });
  },

  update: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      isExpanded?: boolean;
    },
  ) => {
    return client.PUT("/modules/{id}", {
      params: { path: { id } },
      body: data,
    });
  },

  delete: async (id: string) => {
    return client.DELETE("/modules/{id}", {
      params: { path: { id } },
    });
  },

  reorder: async (id: string, newOrder: number) => {
    return client.PATCH("/modules/{id}/order", {
      params: { path: { id } },
      body: { newOrder },
    });
  },
};

const learningTasks = {
  create: async (
    learningModuleId: string,
    data: {
      title: string;
      description?: string;
      dueDate?: string;
      memo?: string;
    },
  ) => {
    return client.POST("/tasks", {
      body: {
        learningModuleId,
        ...data,
      },
    });
  },

  detail: async (id: string) => {
    return client.GET("/tasks/{id}", {
      params: { path: { id } },
    });
  },

  update: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      isCompleted?: boolean;
      dueDate?: string | null;
      memo?: string;
    },
  ) => {
    return client.PUT("/tasks/{id}", {
      params: { path: { id } },
      body: data,
    });
  },

  delete: async (id: string) => {
    return client.DELETE("/tasks/{id}", {
      params: { path: { id } },
    });
  },

  move: async (
    id: string,
    data: {
      newLearningModuleId: string;
      newOrder?: number;
    },
  ) => {
    return client.PATCH("/tasks/{id}/move", {
      params: { path: { id } },
      body: data,
    });
  },

  getNote: async (id: string) => {
    return client.GET("/tasks/{id}/notes", {
      params: { path: { id } },
    });
  },

  getQuiz: async (id: string) => {
    return client.GET("/tasks/{id}/quizzes", {
      params: { path: { id } },
    });
  },

  submitQuiz: async (
    quizId: string,
    answers: Array<{ questionId: string; selectedIndex: number }>,
  ) => {
    return client.POST("/quizzes/{id}/submit", {
      params: { path: { id: quizId } },
      body: { answers },
    });
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
    return client.POST("/ai/plans/generate", {
      body: data,
    });
  },

  generateLearningTaskNote: async (
    taskId: string,
    options?: {
      force?: boolean;
    },
  ) => {
    return client.POST("/tasks/{id}/notes", {
      params: {
        path: { id: taskId },
        query:
          options?.force !== undefined
            ? {
                force: options.force,
              }
            : undefined,
      },
    });
  },

  generateLearningTaskQuiz: async (
    taskId: string,
    options?: {
      force?: boolean;
    },
  ) => {
    return client.POST("/tasks/{id}/quizzes", {
      params: {
        path: { id: taskId },
        query:
          options?.force !== undefined
            ? {
                force: options.force,
              }
            : undefined,
      },
    });
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
