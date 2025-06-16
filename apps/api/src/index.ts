import { createErrorResponse } from "@/api/helpers/api-response";
import sessionMiddleware from "@/api/middlewares/session.middleware";
import platformRoutes from "@/api/routes/platform";
import { DatabaseError } from "@/common/errors/database-error";
import { HTTPError } from "@/common/errors/http-error";
import { Context } from "@/common/types/hono.types";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import "dotenv/config";
import { handle } from "hono/aws-lambda";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import status from "http-status";
import { ZodError } from "zod";

const ORIGIN: string[] | string = "http://localhost:3000";

const app = new OpenAPIHono<Context>();

app.use(logger());
app.use(
  "*",
  cors({
    origin: ORIGIN,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(
  csrf({
    origin: ORIGIN,
  }),
);

app.use(sessionMiddleware);

app.get("/ui", swaggerUI({ url: "/doc" }));
app.get("/", (c) => {
  return c.json({
    message: "Hello World",
  });
});

app.route("/platform", platformRoutes);

app.doc("/doc", {
  openapi: "3.1.0",
  info: {
    title: "API",
    version: "1.0.0",
    description: "API",
  },
});

app.onError((err, c) => {
  console.error(`${err.name}: ${err.message}`);
  if (err instanceof HTTPError) {
    const statusCode = err.getStatusCode();
    return c.json(
      createErrorResponse(statusCode, err.getMessage(), err.getDetails()),
      statusCode,
    );
  }

  if (err instanceof DatabaseError) {
    const statusCode = err.getStatusCode();
    return c.json(
      createErrorResponse(statusCode, err.getMessage()),
      statusCode,
    );
  }

  if (err instanceof ZodError) {
    const message = err.errors.map((e) => e.message);
    return c.json(
      createErrorResponse(status.BAD_REQUEST, "Validation Error", message),
      status.BAD_REQUEST,
    );
  }

  return c.json(
    createErrorResponse(status.INTERNAL_SERVER_ERROR, "Internal Server Error"),
    status.INTERNAL_SERVER_ERROR,
  );
});

export const handler = handle(app);