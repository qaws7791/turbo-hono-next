import { OpenAPIHono } from "@hono/zod-openapi";
import generateRoadmap from "./routes/generate";

const aiApp = new OpenAPIHono();

aiApp.route("/", generateRoadmap);

export default aiApp;