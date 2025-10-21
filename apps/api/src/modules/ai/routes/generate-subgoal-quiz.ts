import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { authMiddleware, type AuthContext } from "../../../middleware/auth";
import { AIError } from "../errors";
import {
  prepareSubGoalQuizGeneration,
  runSubGoalQuizGeneration,
  serializeQuizRecord,
  SUB_GOAL_QUIZ_STATUS,
} from "../services/subgoal-quiz-service";
import { generateSubGoalQuizRoute } from "@repo/api-spec/modules/ai/routes";

const generateSubGoalQuiz = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...generateSubGoalQuizRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");

      if (!auth?.user?.id) {
        throw new AIError(
          401,
          "ai:authentication_required",
          "User authentication required",
        );
      }

      const { roadmapId, subGoalId } = c.req.valid("param");
      const query = c.req.valid("query") ?? {};

      const { started, record, latestResult, job } =
        await prepareSubGoalQuizGeneration({
          userId: auth.user.id,
          roadmapPublicId: roadmapId,
          subGoalPublicId: subGoalId,
          force: query.force,
        });

      const payload = serializeQuizRecord(record, latestResult);

      if (started && job) {
        void runSubGoalQuizGeneration(job);
        return c.json(payload, status.ACCEPTED);
      }

      return c.json(payload, status.OK);
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }

      console.error("AI sub-goal quiz generation error:", error);

      return c.json(
        {
          id: "",
          status: SUB_GOAL_QUIZ_STATUS.failed,
          targetQuestionCount: 4,
          totalQuestions: null,
          requestedAt: null,
          completedAt: null,
          errorMessage:
            "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          questions: null,
          latestResult: null,
        },
        status.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

export default generateSubGoalQuiz;
