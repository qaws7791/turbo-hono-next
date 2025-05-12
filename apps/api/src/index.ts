import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import "dotenv/config";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import platformRoutes from "./routes/platform";
import { Context } from "./types/hono.types";
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

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
