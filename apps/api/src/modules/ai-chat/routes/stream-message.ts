import { OpenAPIHono } from "@hono/zod-openapi";
import { streamText } from "ai";
import status from "http-status";
import { streamMessageRoute } from "@repo/api-spec";

import { authMiddleware } from "../../../middleware/auth";
import { log } from "../../../lib/logger";
import { geminiModel } from "../../../external/ai/provider";
import { conversationCommandService } from "../services/conversation-command.service";
import { conversationQueryService } from "../services/conversation-query.service";
import { messageCommandService } from "../services/message-command.service";
import { messageQueryService } from "../services/message-query.service";
import { learningPlanQueryService } from "../../learning-plan/services/learning-plan.query.service";
import { learningModuleQueryService } from "../../learning-plan/services/learning-module.query.service";
import {
  createModuleTool,
  deleteModuleTool,
  listModulesTool,
  updateModuleTool,
} from "../tools/learning-module.tool";
import {
  completeTasksTool,
  createTaskTool,
  deleteTaskTool,
  listTasksTool,
  updateTaskTool,
} from "../tools/learning-task.tool";
import {
  getModuleDetailsTool,
  getPlanDetailsTool,
  getProgressTool,
} from "../tools/query-info.tool";

import type { StoredToolInvocation } from "../types";
import type { AuthContext } from "../../../middleware/auth";

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

    try {
      // Get or create conversation
      let conversation;
      if (conversationId) {
        // Verify ownership
        const existing = await conversationQueryService.getConversation(
          conversationId,
          auth.user.id,
        );
        conversation = existing;
      } else {
        // Create new conversation
        if (!learningPlanId) {
          return c.json(
            { error: "learningPlanId is required for new conversations" },
            status.BAD_REQUEST,
          );
        }
        conversation = await conversationCommandService.createConversation({
          learningPlanId,
          userId: auth.user.id,
          title: message.substring(0, 100), // Use first 100 chars as title
        });
      }

      // Get learning plan details for context
      const learningPlan = await learningPlanQueryService.getLearningPlan({
        publicId: String(conversation.learningPlanId),
        userId: auth.user.id,
      });

      // Get modules for context
      const modules = await learningModuleQueryService.listModulesByPlan(
        String(conversation.learningPlanId),
        auth.user.id,
      );

      // Build learning plan context
      const planContext = `
학습 계획 정보:
- 제목: ${learningPlan.title}
- 학습 주제: ${learningPlan.learningTopic}
- 목표 기간: ${learningPlan.targetWeeks}주
- 주간 학습 시간: ${learningPlan.weeklyHours}시간
- 사용자 레벨: ${learningPlan.userLevel}
- 학습 계획 ID: ${learningPlan.id}

모듈 구조:
${modules
  .map((module: { title: string; id: string; description: string | null }) => {
    return `- ${module.title} (ID: ${module.id})${module.description ? `: ${module.description}` : ""}`;
  })
  .join("\n")}
`;

      const systemPrompt = `당신은 학습 계획을 관리하고 학습자를 돕는 AI 튜터입니다.

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

      // Get message history (last 20 messages)
      const messageHistory = await messageQueryService.getLatestMessages(
        conversation.id,
        auth.user.id,
        20,
      );

      const formattedHistory =
        messageQueryService.formatMessagesForAI(messageHistory);

      // Save user message
      await messageCommandService.saveMessage({
        conversationId: conversation.id,
        role: "user",
        content: message,
        userId: auth.user.id,
      });

      // Stream the AI response
      const result = streamText({
        model: geminiModel,
        system: systemPrompt,
        messages: [
          // Filter out tool messages and map to AI SDK format
          ...formattedHistory
            .filter((msg) => msg.role !== "tool")
            .map((msg) => {
              if (msg.role === "user") {
                return { role: "user" as const, content: msg.content };
              } else {
                return { role: "assistant" as const, content: msg.content };
              }
            }),
          {
            role: "user" as const,
            content: message,
          },
        ],
        tools: {
          createModule: createModuleTool,
          updateModule: updateModuleTool,
          deleteModule: deleteModuleTool,
          listModules: listModulesTool,
          createTask: createTaskTool,
          updateTask: updateTaskTool,
          deleteTask: deleteTaskTool,
          completeTasks: completeTasksTool,
          listTasks: listTasksTool,
          getProgress: getProgressTool,
          getPlanDetails: getPlanDetailsTool,
          getModuleDetails: getModuleDetailsTool,
        },
        async onFinish({ text, toolCalls, toolResults }) {
          // Save assistant message
          await messageCommandService.saveMessage({
            conversationId: conversation.id,
            role: "assistant",
            content: text,
            userId: auth.user.id,
            toolInvocations:
              toolCalls && toolCalls.length > 0
                ? (toolCalls.map((call, index) => {
                    // Extract args from call object (Vercel AI SDK internal property)
                    const callWithArgs = call as typeof call & {
                      args?: Record<string, unknown>;
                    };
                    return {
                      toolCallId: call.toolCallId,
                      toolName: call.toolName,
                      arguments: callWithArgs.args || {},
                      result: toolResults?.[index],
                    };
                  }) as Array<StoredToolInvocation>)
                : undefined,
          });

          // Update conversation timestamp
          await conversationCommandService.updateConversationTitle(
            conversation.id,
            auth.user.id,
            conversation.title || message.substring(0, 100),
          );

          log.info("AI message completed", {
            conversationId: conversation.id,
            userId: auth.user.id,
            messageLength: text.length,
            toolCallsCount: toolCalls?.length ?? 0,
          });
        },
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

export default streamMessage;
