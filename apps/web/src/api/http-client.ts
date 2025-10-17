import createClient from "openapi-fetch";
import type { paths } from "./schema";

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

const roadmaps = {
  list: async (params?: {
    cursor?: string;
    limit?: number;
    search?: string;
    status?: "active" | "archived";
    sort?: "created_at" | "updated_at" | "title";
    order?: "asc" | "desc";
  }) => {
    return client.GET("/roadmaps", {
      params: { query: params },
    });
  },

  detail: async (roadmapId: string) => {
    return client.GET("/roadmaps/{roadmapId}", {
      params: { path: { roadmapId } },
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
    additionalRequirements?: string;
  }) => {
    return client.POST("/roadmaps", {
      body: data,
    });
  },

  update: async (
    roadmapId: string,
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
      additionalRequirements?: string;
    },
  ) => {
    return client.PATCH("/roadmaps/{id}", {
      params: { path: { roadmapId } },
      body: data,
    });
  },

  delete: async (roadmapId: string) => {
    return client.DELETE("/roadmaps/{id}", {
      params: { path: { roadmapId } },
    });
  },

  updateStatus: async (roadmapId: string, status: "active" | "archived") => {
    return client.PATCH("/roadmaps/{id}/status", {
      params: { path: { roadmapId } },
      body: { status },
    });
  },
};

const goals = {
  create: async (
    roadmapId: string,
    data: {
      title: string;
      description?: string;
      isExpanded?: boolean;
    },
  ) => {
    return client.POST("/roadmaps/{roadmapId}/goals", {
      params: { path: { roadmapId } },
      body: data,
    });
  },

  update: async (
    roadmapId: string,
    goalId: string,
    data: {
      title?: string;
      description?: string;
      isExpanded?: boolean;
    },
  ) => {
    return client.PUT("/roadmaps/{roadmapId}/goals/{goalId}", {
      params: { path: { roadmapId, goalId } },
      body: data,
    });
  },

  delete: async (roadmapId: string, goalId: string) => {
    return client.DELETE("/roadmaps/{roadmapId}/goals/{goalId}", {
      params: { path: { roadmapId, goalId } },
    });
  },

  reorder: async (roadmapId: string, goalId: string, newOrder: number) => {
    return client.PATCH("/roadmaps/{roadmapId}/goals/{goalId}/order", {
      params: { path: { roadmapId, goalId } },
      body: { newOrder },
    });
  },
};

const subGoals = {
  create: async (
    roadmapId: string,
    goalId: string,
    data: {
      title: string;
      description?: string;
      dueDate?: string;
      memo?: string;
    },
  ) => {
    return client.POST("/roadmaps/{roadmapId}/goals/{goalId}/sub-goals", {
      params: { path: { roadmapId, goalId } },
      body: data,
    });
  },

  detail: async (roadmapId: string, subGoalId: string) => {
    return client.GET("/roadmaps/{roadmapId}/sub-goals/{subGoalId}", {
      params: { path: { roadmapId, subGoalId } },
    });
  },

  update: async (
    roadmapId: string,
    subGoalId: string,
    data: {
      title?: string;
      description?: string;
      isCompleted?: boolean;
      dueDate?: string | null;
      memo?: string;
    },
  ) => {
    return client.PUT("/roadmaps/{roadmapId}/sub-goals/{subGoalId}", {
      params: { path: { roadmapId, subGoalId } },
      body: data,
    });
  },

  delete: async (roadmapId: string, goalId: string, subGoalId: string) => {
    return client.DELETE(
      "/roadmaps/{roadmapId}/goals/{goalId}/sub-goals/{subGoalId}",
      {
        params: { path: { roadmapId, goalId, subGoalId } },
      },
    );
  },

  move: async (
    roadmapId: string,
    goalId: string,
    subGoalId: string,
    data: {
      newGoalId: string;
      newOrder?: number;
    },
  ) => {
    return client.PATCH(
      "/roadmaps/{roadmapId}/goals/{goalId}/sub-goals/{subGoalId}/move",
      {
        params: { path: { roadmapId, goalId, subGoalId } },
        body: data,
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
      body: formData as any,
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
  generateRoadmap: async (data: {
    documentIds?: string[];
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
    return client.POST("/ai/roadmaps/generate", {
      body: data,
    });
  },

  generateSubGoalNote: async (
    roadmapId: string,
    subGoalId: string,
    options?: {
      force?: boolean;
    },
  ) => {
    return client.POST("/ai/roadmaps/{roadmapId}/sub-goals/{subGoalId}/notes", {
      params: {
        path: { roadmapId, subGoalId },
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
  roadmaps,
  goals,
  subGoals,
  progress,
  documents,
  ai,
} as const;
