import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

import { aiRoutes } from "./modules/ai/routes";
import { authRoutes } from "./modules/auth/routes";
import { documentRoutes } from "./modules/documents/routes";
import { progressRoutes } from "./modules/progress/routes";
import { learningPlanRoutes } from "./modules/learning-plan/routes";

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

  const routes = [
    ...authRoutes,
    ...documentRoutes,
    ...progressRoutes,
    ...aiRoutes,
    ...learningPlanRoutes,
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
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Learning Plan API",
      version: "1.0.0",
      description:
        "API specification for the learning plan service, including authentication, AI integration, and progress tracking.",
    },
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
