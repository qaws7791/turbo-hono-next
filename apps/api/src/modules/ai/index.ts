import { OpenAPIHono } from "@hono/zod-openapi";

import generateRoadmap from "./routes/generate";
import generateSubGoalNote from "./routes/generate-subgoal-note";
import generateSubGoalQuiz from "./routes/generate-subgoal-quiz";

const aiApp = new OpenAPIHono();

aiApp.route("/", generateRoadmap);
aiApp.route("/", generateSubGoalNote);
aiApp.route("/", generateSubGoalQuiz);

export default aiApp;
