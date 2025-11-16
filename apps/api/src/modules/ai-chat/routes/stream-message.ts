import { randomUUID } from "crypto";

import { OpenAPIHono } from "@hono/zod-openapi";
import { streamMessageRoute } from "@repo/api-spec";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
} from "ai";
import status from "http-status";

import { geminiModel } from "../../../external/ai/provider";
import { log } from "../../../lib/logger";
import { authMiddleware } from "../../../middleware/auth";
import { learningPlanRepository } from "../../learning-plan/repositories/learning-plan.repository";
import { learningModuleQueryService } from "../../learning-plan/services/learning-module.query.service";
import { learningPlanQueryService } from "../../learning-plan/services/learning-plan.query.service";
import { AIChatErrors } from "../errors";
import { conversationQueryService } from "../services/conversation-query.service";
import { messageCommandService } from "../services/message-command.service";
import { messageQueryService } from "../services/message-query.service";
import { createTools } from "../tools/create-tools";

import type { AppUIMessage } from "@repo/ai-types";
import type { AIMessage } from "@repo/database";
import type { AuthContext } from "../../../middleware/auth";
import type { LearningPlanDetailResponse } from "../../learning-plan/services/learning-plan.query.service";

const streamMessage = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...streamMessageRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const body = c.req.valid("json");
    const conversationId = body.conversationId as string;
    const messages = body.messages as Array<AppUIMessage>;

    const userId = auth.user.id;
    log.info("streamMessage", { auth, body });

    if (!conversationId) {
      return c.json(
        { error: "conversationId is required for new conversations" },
        status.BAD_REQUEST,
      );
    }

    try {
      // Get conversation
      const conversation = await conversationQueryService.getConversation(
        conversationId,
        userId,
      );

      // Get learning plan context
      const planContext = await buildLearningPlanContext(
        conversation.learningPlanId,
        userId,
      );

      const systemPrompt = composeSystemPrompt(planContext.planContext);

      // Get message history (last 20 messages)
      const messagesFromDB = await messageQueryService.getLatestMessages(
        conversation.id,
        userId,
        20,
      );

      const savedMessages = await messageCommandService.saveMessages({
        conversationId: conversation.id,
        userId,
        messages: messages.map((msg) => ({
          id: msg.id,
          conversationId: conversationId,
          role: msg.role,
          parts: msg.parts,
          attachments: [],
          createdAt: new Date(),
        })),
      });

      const uiMessages: Array<AppUIMessage> = [
        ...convertToUIMessages(messagesFromDB),
        ...savedMessages.map((msg) => ({
          id: msg.id,
          role: msg.role as AppUIMessage["role"],
          parts: msg.parts as AppUIMessage["parts"],
          attachments: [],
          createdAt: msg.createdAt,
        })),
      ];

      const stream = createUIMessageStream({
        execute: ({ writer: dataStream }) => {
          const result = streamText({
            model: geminiModel,
            system: systemPrompt,
            messages: convertToModelMessages(uiMessages),
            stopWhen: stepCountIs(5),
            tools: createTools(userId, planContext.learningPlan.id),
          });

          result.consumeStream();

          dataStream.merge(
            result.toUIMessageStream({
              sendReasoning: true,
            }),
          );
        },
        generateId: randomUUID,
        onFinish: async ({ messages }) => {
          await messageCommandService.saveMessages({
            conversationId: conversation.id,
            userId,
            messages: messages.map((currentMessage) => ({
              id: currentMessage.id,
              conversationId: conversation.id,
              role: currentMessage.role,
              parts: currentMessage.parts,
              createdAt: new Date(),
              attachments: [],
            })),
          });
        },
        onError: () => {
          return "Oops, an error occurred!";
        },
      });

      // Return UI Message Stream Response (AI SDK v5 표준)
      // toUIMessageStreamResponse()는 텍스트, 도구 호출, 메타데이터를 모두 포함
      return createUIMessageStreamResponse({
        stream,
      });
    } catch (error) {
      log.error("Failed to stream message", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: auth.user.id,
        conversationId,
      });

      return c.json(
        {
          error:
            error instanceof Error ? error.message : "Failed to stream message",
        },
        status.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

async function buildLearningPlanContext(
  learningPlanId: number,
  userId: string,
): Promise<{
  learningPlan: LearningPlanDetailResponse;
  modules: Array<ModuleSummary>;
  planContext: string;
}> {
  const learningPlanData =
    await learningPlanRepository.findById(learningPlanId);

  if (!learningPlanData) {
    throw AIChatErrors.learningPlanNotFound();
  }

  const [learningPlan, modules] = await Promise.all([
    learningPlanQueryService.getLearningPlan({
      publicId: learningPlanData.publicId,
      userId,
    }),
    learningModuleQueryService.listModulesByPlan(
      learningPlanData.publicId,
      userId,
    ),
  ]);

  return {
    learningPlan,
    modules,
    planContext: formatPlanContext(learningPlan, modules),
  };
}

function composeSystemPrompt(planContext: string): string {
  const currentDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: "Asia/Seoul",
  });

  return `당신은 학습 계획을 관리하고 학습자를 돕는 AI 튜터입니다.

오늘 날짜: ${currentDate}

현재 학습자의 학습 계획:
${planContext}

당신의 역할:
1. 학습 계획, 모듈, 태스크에 대한 질문에 답변합니다.
2. 학습 진도를 확인하고 피드백을 제공합니다.
3. 필요시 모듈이나 태스크를 생성, 수정, 삭제할 수 있습니다.
4. 학습자가 요청하면 학습 계획을 조정할 수 있습니다.

주의사항:
- 한국어로 친절하고 명확하게 답변하세요.
- 학습자의 학습 목표와 진도를 고려하여 조언하세요.
- 도구를 사용할 때는 반드시 학습자에게 무엇을 하는지 설명하세요.
- 학습 계획을 수정할 때는 학습자의 동의를 먼저 구하세요.`;
}

type ModuleSummary = {
  id: string;
  title: string;
  description: string | null;
};

function formatPlanContext(
  learningPlan: LearningPlanDetailResponse,
  modules: Array<ModuleSummary>,
): string {
  const moduleDescription = modules
    .map((module) => {
      const description = module.description ? `: ${module.description}` : "";
      return `- ${module.title} (ID: ${module.id})${description}`;
    })
    .join("\n");

  return `학습 계획 정보:
- 제목: ${learningPlan.title}
- 학습 주제: ${learningPlan.learningTopic}
- 목표 기간: ${learningPlan.targetWeeks}주
- 주간 학습 시간: ${learningPlan.weeklyHours}시간
- 사용자 레벨: ${learningPlan.userLevel}
- 학습 계획 ID: ${learningPlan.id}

모듈 구조:
${moduleDescription}`;
}

function convertToUIMessages(messages: Array<AIMessage>): Array<AppUIMessage> {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as "user" | "assistant" | "system",
    parts: message.parts as AppUIMessage["parts"],
  }));
}

export default streamMessage;
