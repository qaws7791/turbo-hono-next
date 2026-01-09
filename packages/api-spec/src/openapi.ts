import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";

import { ErrorResponseSchema } from "./common/schema";
import { authRoutes } from "./modules/auth/routes";
import { chatRoutes } from "./modules/chat/routes";
import { materialRoutes } from "./modules/materials/routes";
import { planRoutes } from "./modules/plans/routes";
import { sessionRoutes } from "./modules/sessions/routes";

const registry = new OpenAPIRegistry();

let initialized = false;

const ensureInitialized = () => {
  if (initialized) return;

  registry.registerComponent("securitySchemes", "cookieAuth", {
    type: "apiKey",
    in: "cookie",
    name: "session",
    description: "Session cookie for user authentication",
  });

  registry.register("ErrorResponse", ErrorResponseSchema);

  const routes = [
    ...authRoutes,
    ...materialRoutes,
    ...planRoutes,
    ...sessionRoutes,
    ...chatRoutes,
  ] as const;

  routes.forEach((route) => registry.registerPath(route));

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
      title: "Learning OS API",
      version: "1.0.0",
      description: "Learning OS (docs 기반) API 문서입니다.",
    },
    servers: [
      { url: "http://localhost:3001", description: "Development server" },
    ],
    security: [{ cookieAuth: [] }],
  });
};
