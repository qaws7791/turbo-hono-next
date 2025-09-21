import { OpenAPIHono } from "@hono/zod-openapi";

import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { CONFIG } from "./config";
import { handleError } from "./errors/error-handler";
import aiApp from "./modules/ai";
import authApp from "./modules/auth";
import roadmapApp from "./modules/roadmap";

function createApp() {
  const app = new OpenAPIHono();

  app.use(
    "/*",
    cors({
      origin: [CONFIG.BASE_URL, "http://localhost:8787", "http://localhost"],
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

  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Local Creator Market API",
      description: "API for local creator marketplace with authentication",
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
  return app;
}

const routes = [authApp, roadmapApp, aiApp] as const;

const app = createApp();

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = (typeof routes)[number];
export default app;
