import { OpenAPIHono } from "@hono/zod-openapi";

import generateLearningPlan from "./routes/generate";
import generateLearningTaskNote from "./routes/generate-learning-task-note";
import generateLearningTaskQuiz from "./routes/generate-learning-task-quiz";
import getPlanRecommendationsRoute from "./routes/suggest-defaults";

const aiApp = new OpenAPIHono();

aiApp.route("/", generateLearningPlan);
aiApp.route("/", generateLearningTaskNote);
aiApp.route("/", generateLearningTaskQuiz);
aiApp.route("/", getPlanRecommendationsRoute);

export default aiApp;
