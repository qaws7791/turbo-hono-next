import { OpenAPIHono } from "@hono/zod-openapi";
import { generateOpenApiDocument } from "@repo/api-spec/openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";

import { CONFIG } from "./config";
import { handleError } from "./errors/error-handler";
import { loggerMiddleware } from "./middleware/logger";
import aiApp from "./modules/ai";
import aiChatApp from "./modules/ai-chat";
import authApp from "./modules/auth";
import documentsApp from "./modules/documents";
import learningPlanApp from "./modules/learning-plan";
import progressApp from "./modules/progress";

function createApp() {
  const app = new OpenAPIHono();

  app.use(loggerMiddleware);
  app.use(
    "/*",
    cors({
      origin: [
        CONFIG.BASE_URL,
        "http://localhost:8787",
        "http://localhost:4000",
      ],
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    }),
  );
  app.onError(handleError);
  app.get("/ui", Scalar({ url: "/doc" }));
  app.openAPIRegistry.registerComponent("securitySchemes", "cookieAuth", {
    type: "apiKey",
    in: "cookie",
    name: "session",
    description: "Session cookie for user authentication",
  });

  const document = generateOpenApiDocument();
  app.doc("/doc", () => document);
  return app;
}

const routes = [
  authApp,
  learningPlanApp,
  progressApp,
  aiApp,
  aiChatApp,
  documentsApp,
] as const;

const app = createApp();

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = (typeof routes)[number];
export default app;
