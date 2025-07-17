import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import "reflect-metadata";
import authController from "./modules/auth/api/auth.controller";
import { uploadController } from "./modules/uploads/api/upload.controller";
import userController from "./modules/users/api/users.controller";
import { APP_CONFIG } from "./shared/config/app.config";
import { handleError } from "./shared/errors/error-handler";

const app = new OpenAPIHono();

app.use(logger());

app.use(
  "/*",
  cors({
    origin: [APP_CONFIG.BASE_URL, "http://localhost:8787", "http://localhost"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// Health check
app.get("/", (c) => {
  return c.json({
    message: "Local Creator Market API",
    version: "1.0.0",
    status: "healthy",
  });
});

app.route("/", authController);
app.route("/", userController);
app.route("/", uploadController);

app.get(
  "/ui",
  swaggerUI({
    url: "/doc",
  }),
);

// OpenAPI documentation
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Local Creator Market API",
    description: "API for local creator marketplace with authentication",
  },
  servers: [
    {
      url: "http://localhost:8787",
      description: "Development server",
    },
  ],
  security: [
    {
      SessionCookie: [],
    },
  ],
});

app.onError((error, c) => {
  return handleError(error, c);
});

export default app;
