import { OpenAPIHono } from "@hono/zod-openapi";
import { streamMessageRoute } from "@repo/api-spec";
import { stepCountIs, streamText } from "ai";
import status from "http-status";

import { geminiModel } from "../../../external/ai/provider";
import { log } from "../../../lib/logger";
import { authMiddleware } from "../../../middleware/auth";
import { learningPlanRepository } from "../../learning-plan/repositories/learning-plan.repository";
import { learningModuleQueryService } from "../../learning-plan/services/learning-module.query.service";
import { learningPlanQueryService } from "../../learning-plan/services/learning-plan.query.service";
import { AIChatErrors } from "../errors";
import { conversationCommandService } from "../services/conversation-command.service";
import { conversationQueryService } from "../services/conversation-query.service";
import { messageCommandService } from "../services/message-command.service";
import { messageQueryService } from "../services/message-query.service";
import {
  createCreateModuleTool,
  createDeleteModuleTool,
  createListModulesTool,
  createUpdateModuleTool,
} from "../tools/learning-module.tool";
import {
  createBulkUpdateTasksTool,
  createCompleteTasksTool,
  createCreateTaskTool,
  createDeleteTaskTool,
  createListTasksTool,
  createUpdateTaskTool,
} from "../tools/learning-task.tool";
import {
  createGetModuleDetailsTool,
  createGetPlanDetailsTool,
  createGetProgressTool,
} from "../tools/query-info.tool";

import type { StreamTextOnFinishCallback, ToolSet } from "ai";
import type { AuthContext } from "../../../middleware/auth";
import type { LearningPlanDetailResponse } from "../../learning-plan/services/learning-plan.query.service";
import type { StoredToolInvocation } from "../types";

type ConversationEntity = Awaited<
  ReturnType<typeof conversationQueryService.getConversation>
>;
type FormattedMessage = ReturnType<
  typeof messageQueryService.formatMessagesForAI
>[number];

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
    const { conversationId, message, learningPlanId } = body;
    const userId = auth.user.id;
    log.info("streamMessage", { auth, body });

    if (!conversationId && !learningPlanId) {
      return c.json(
        { error: "learningPlanId is required for new conversations" },
        status.BAD_REQUEST,
      );
    }

    try {
      const conversation = await ensureConversation({
        conversationId,
        learningPlanId,
        message,
        userId,
      });

      const planContext = await buildLearningPlanContext(
        conversation.learningPlanId,
        userId,
      );

      const systemPrompt = composeSystemPrompt(planContext);

      // Get message history (last 20 messages)
      const messageHistory = await messageQueryService.getLatestMessages(
        conversation.id,
        userId,
        20,
      );

      const formattedHistory =
        messageQueryService.formatMessagesForAI(messageHistory);

      // Save user message
      await messageCommandService.saveMessage({
        conversationId: conversation.id,
        role: "user",
        content: message,
        userId,
      });

      // Stream the AI response
      const result = streamText({
        model: geminiModel,
        system: systemPrompt,
        messages: createAiMessages(formattedHistory, message),
        temperature: 0,
        tools: createTools(userId, learningPlanId),
        stopWhen: stepCountIs(10),
        onFinish: createOnFinishHandler({
          conversation,
          message,
          userId,
        }),
      });

      // Return SSE stream
      return result.toTextStreamResponse();
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

interface EnsureConversationParams {
  conversationId?: string | null;
  learningPlanId?: string | null;
  message: string;
  userId: string;
}

function createTools(userId: string, learningPlanId: string) {
  return {
    createModule: createCreateModuleTool(userId, learningPlanId),
    updateModule: createUpdateModuleTool(userId, learningPlanId),
    deleteModule: createDeleteModuleTool(userId, learningPlanId),
    listModules: createListModulesTool(userId, learningPlanId),
    createTask: createCreateTaskTool(userId, learningPlanId),
    updateTask: createUpdateTaskTool(userId, learningPlanId),
    deleteTask: createDeleteTaskTool(userId, learningPlanId),
    completeTasks: createCompleteTasksTool(userId, learningPlanId),
    bulkUpdateTasks: createBulkUpdateTasksTool(userId, learningPlanId),
    listTasks: createListTasksTool(userId, learningPlanId),
    getProgress: createGetProgressTool(userId, learningPlanId),
    getPlanDetails: createGetPlanDetailsTool(userId, learningPlanId),
    getModuleDetails: createGetModuleDetailsTool(
      userId,
      String(learningPlanId),
    ),
  } as const;
}

async function ensureConversation(
  params: EnsureConversationParams,
): Promise<ConversationEntity> {
  const { conversationId, learningPlanId, message, userId } = params;

  if (conversationId) {
    return conversationQueryService.getConversation(conversationId, userId);
  }

  if (!learningPlanId) {
    throw new Error("learningPlanId is required");
  }

  const learningPlan = await learningPlanRepository.findByPublicId(
    learningPlanId,
    userId,
  );

  if (!learningPlan) {
    throw AIChatErrors.learningPlanNotFound();
  }

  return conversationCommandService.createConversation({
    learningPlanId: learningPlan.id,
    userId,
    title: message.substring(0, 100),
  });
}

async function buildLearningPlanContext(
  learningPlanId: number,
  userId: string,
): Promise<string> {
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

  return formatPlanContext(learningPlan, modules);
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

function createAiMessages(
  formattedHistory: Array<FormattedMessage>,
  userMessage: string,
) {
  const history = formattedHistory
    .filter((msg) => msg.role !== "tool")
    .map((msg) => {
      if (msg.role === "user") {
        return { role: "user" as const, content: msg.content };
      }

      return { role: "assistant" as const, content: msg.content };
    });

  return [
    ...history,
    {
      role: "user" as const,
      content: userMessage,
    },
  ];
}

interface FinishHandlerParams {
  conversation: ConversationEntity;
  message: string;
  userId: string;
}

function createOnFinishHandler<TToolSet extends ToolSet>(
  params: FinishHandlerParams,
): StreamTextOnFinishCallback<TToolSet> {
  const { conversation, message, userId } = params;

  return async ({ text, toolCalls, toolResults }) => {
    await messageCommandService.saveMessage({
      conversationId: conversation.id,
      role: "assistant",
      content: text,
      userId,
      toolInvocations: formatToolInvocations(toolCalls, toolResults),
    });

    await conversationCommandService.updateConversationTitle(
      conversation.id,
      userId,
      conversation.title || message.substring(0, 100),
    );

    log.info("AI message completed", {
      conversationId: conversation.id,
      userId,
      messageLength: text.length,
      toolCallsCount: toolCalls?.length ?? 0,
    });
  };
}

function formatToolInvocations(
  toolCalls?: Array<{
    toolCallId: string;
    toolName: string;
  }>,
  toolResults?: Array<unknown>,
): Array<StoredToolInvocation> | undefined {
  if (!toolCalls || toolCalls.length === 0) {
    return undefined;
  }

  return toolCalls.map((call, index) => {
    const callWithArgs = call as typeof call & {
      args?: Record<string, unknown>;
    };

    return {
      toolCallId: call.toolCallId,
      toolName: call.toolName,
      arguments: callWithArgs.args || {},
      result: toolResults?.[index],
    };
  }) as Array<StoredToolInvocation>;
}

export default streamMessage;
