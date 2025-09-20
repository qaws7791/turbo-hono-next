import { OpenAPIHono } from "@hono/zod-openapi";
import changePassword from "./modules/auth/routes/change-password";
import loginWithEmail from "./modules/auth/routes/login-with-email";
import logout from "./modules/auth/routes/logout";
import me from "./modules/auth/routes/me";
import signup from "./modules/auth/routes/signup";

import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { CONFIG } from "./config";
import { handleError } from "./errors/error-handler";
import aiApp from "./modules/ai";
import create from "./modules/roadmap/routes/create";
import deleteRoadmap from "./modules/roadmap/routes/delete";
import createGoal from "./modules/roadmap/routes/goals/create-goal";
import deleteGoal from "./modules/roadmap/routes/goals/delete-goal";
import reorderGoal from "./modules/roadmap/routes/goals/reorder-goal";
import updateGoal from "./modules/roadmap/routes/goals/update-goal";
import list from "./modules/roadmap/routes/list";
import changeStatus from "./modules/roadmap/routes/status";
import createSubGoal from "./modules/roadmap/routes/sub-goals/create-sub-goal";
import deleteSubGoal from "./modules/roadmap/routes/sub-goals/delete-sub-goal";
import moveSubGoal from "./modules/roadmap/routes/sub-goals/move-sub-goal";
import updateSubGoal from "./modules/roadmap/routes/sub-goals/update-sub-goal";
import update from "./modules/roadmap/routes/update";

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

const app = createApp();

app.route("/", loginWithEmail);
app.route("/", signup);
app.route("/", logout);
app.route("/", me);
app.route("/", changePassword);
app.route("/", create);
app.route("/", deleteRoadmap);
app.route("/", list);
app.route("/", changeStatus);
app.route("/", update);
app.route("/", createGoal);
app.route("/", updateGoal);
app.route("/", deleteGoal);
app.route("/", reorderGoal);
app.route("/", createSubGoal);
app.route("/", updateSubGoal);
app.route("/", deleteSubGoal);
app.route("/", moveSubGoal);
app.route("/", aiApp);

export default app;
