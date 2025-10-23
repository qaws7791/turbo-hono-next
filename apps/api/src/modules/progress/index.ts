import { OpenAPIHono } from "@hono/zod-openapi";

import dailyProgress from "./routes/daily";

const progressApp = new OpenAPIHono();
progressApp.route("/", dailyProgress);

export default progressApp;
