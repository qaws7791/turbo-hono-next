import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";

import { ErrorResponseSchema } from "./common/schema";
import { aiRoutes } from "./modules/ai/routes";
import { aiChatRoutes } from "./modules/ai-chat/routes";
import { authRoutes } from "./modules/auth/routes";
import { documentRoutes } from "./modules/documents/routes";
import { learningPlanRoutes } from "./modules/learning-plan/routes";
import { progressRoutes } from "./modules/progress/routes";

const registry = new OpenAPIRegistry();

let initialized = false;

const ensureInitialized = () => {
  if (initialized) {
    return;
  }

  registry.registerComponent("securitySchemes", "cookieAuth", {
    type: "apiKey",
    in: "cookie",
    name: "session",
    description: "Session cookie for user authentication",
  });

  // Register error response schema as a reusable component
  registry.register("ErrorResponse", ErrorResponseSchema);

  const routes = [
    ...authRoutes,
    ...documentRoutes,
    ...progressRoutes,
    ...aiRoutes,
    ...learningPlanRoutes,
    ...aiChatRoutes,
  ];

  routes.forEach((route) => {
    registry.registerPath(route);
  });

  initialized = true;
};

export const getRegistry = () => {
  ensureInitialized();
  return registry;
};

export const generateOpenApiDocument = () => {
  ensureInitialized();
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Learning Plan API",
      version: "1.0.0",
      description:
        "인증, AI 통합, 진행 상황 추적을 포함한 학습 계획 서비스를 위한 API 문서입니다.",
    },
    tags: [
      {
        name: "auth",
        description:
          "인증과 사용자 세션을 생성·조회·종료하는 엔드포인트입니다.",
      },
      {
        name: "learning-plans",
        description:
          "LearningPlan의 생성, 수정, 상태 변경 등 전반적인 수명 주기를 관리합니다.",
      },
      {
        name: "learning-modules",
        description:
          "LearningPlan에 속한 LearningModule을 생성·정렬·삭제하여 학습 단위를 구성합니다.",
      },
      {
        name: "learning-tasks",
        description:
          "LearningModule에 포함된 LearningTask를 관리하고 학습 결과를 제출합니다.",
      },
      {
        name: "ai",
        description:
          "AI 모델을 활용해 LearningPlan, LearningTask에 필요한 콘텐츠를 생성하거나 갱신합니다.",
      },
      {
        name: "ai-chat",
        description:
          "AI 튜터와의 대화를 통해 학습 계획을 관리하고 실시간 피드백을 받습니다.",
      },
      {
        name: "documents",
        description: "학습 자료 PDF를 업로드하고 세부 정보를 확인합니다.",
      },
      {
        name: "progress",
        description: "LearningModule 활동량을 집계하여 학습 현황을 제공합니다.",
      },
    ],
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
    ],
    security: [
      {
        cookieAuth: [],
      },
    ],
  });
};
