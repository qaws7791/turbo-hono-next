import { OpenAPIHono } from "@hono/zod-openapi";

import create from "./routes/create";
import deleteLearningPlan from "./routes/delete";
import detail from "./routes/detail";
import createLearningModule from "./routes/learning-modules/create-learning-module";
import deleteLearningModule from "./routes/learning-modules/delete-learning-module";
import reorderLearningModule from "./routes/learning-modules/reorder-learning-module";
import updateLearningModule from "./routes/learning-modules/update-learning-module";
import list from "./routes/list";
import changeStatus from "./routes/status";
import createLearningTask from "./routes/learning-tasks/create-learning-task";
import deleteLearningTask from "./routes/learning-tasks/delete-learning-task";
import getLearningTask from "./routes/learning-tasks/get-learning-task";
import moveLearningTask from "./routes/learning-tasks/move-learning-task";
import submitLearningTaskQuiz from "./routes/learning-tasks/submit-learning-task-quiz";
import updateLearningTask from "./routes/learning-tasks/update-learning-task";
import update from "./routes/update";

const learningPlanApp = new OpenAPIHono();
learningPlanApp.route("/", create);
learningPlanApp.route("/", deleteLearningPlan);
learningPlanApp.route("/", detail);
learningPlanApp.route("/", list);
learningPlanApp.route("/", changeStatus);
learningPlanApp.route("/", update);
learningPlanApp.route("/", createLearningModule);
learningPlanApp.route("/", updateLearningModule);
learningPlanApp.route("/", deleteLearningModule);
learningPlanApp.route("/", reorderLearningModule);
learningPlanApp.route("/", createLearningTask);
learningPlanApp.route("/", updateLearningTask);
learningPlanApp.route("/", deleteLearningTask);
learningPlanApp.route("/", moveLearningTask);
learningPlanApp.route("/", getLearningTask);
learningPlanApp.route("/", submitLearningTaskQuiz);

export default learningPlanApp;
