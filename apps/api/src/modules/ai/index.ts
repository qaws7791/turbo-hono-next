import { OpenAPIHono } from "@hono/zod-openapi";

import generateLearningPlan from "./routes/generate";
import generateLearningTaskNote from "./routes/generate-learning-task-note";
import generateLearningTaskQuiz from "./routes/generate-learning-task-quiz";

const aiApp = new OpenAPIHono();

aiApp.route("/", generateLearningPlan);
aiApp.route("/", generateLearningTaskNote);
aiApp.route("/", generateLearningTaskQuiz);

export default aiApp;
