import { OpenAPIHono } from "@hono/zod-openapi";
import generateRoadmap from "./routes/generate";
import generateSubGoalNote from "./routes/generate-subgoal-note";

const aiApp = new OpenAPIHono();

aiApp.route("/", generateRoadmap);
aiApp.route("/", generateSubGoalNote);

export default aiApp;
