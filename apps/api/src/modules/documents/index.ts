import { OpenAPIHono } from "@hono/zod-openapi";

import detail from "./routes/detail";
import upload from "./routes/upload";

const documentsApp = new OpenAPIHono();

const documentRoutes = [upload, detail] as const;

documentRoutes.forEach((route) => {
  documentsApp.route("/", route);
});

export default documentsApp;
