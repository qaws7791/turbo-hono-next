import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuButton,
  PromptInputActionMenuContent,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@repo/ui/ai";
import { Icon } from "@repo/ui/icon";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";

import type { AppUIMessage } from "@repo/ai-types";
import type { PromptInputMessage } from "@repo/ui/ai";

import { API_BASE_URL } from "@/env";
import { logger } from "@/shared/utils";
import { generateUUID } from "@/shared/utils/id";

const CHAT_STREAM_URL = `${API_BASE_URL}/chat/stream`;
const chatbotLogger = logger.createScoped("Chatbot");

interface ChatViewProps {
  learningPlanId: string;
  conversationId: string | null;
  initialMessages: Array<AppUIMessage>;
  onMessagesChange: (hasMessages: boolean) => void;
  onChangeTitle?: (title: string) => void;
  onConversationIdUpdate?: (conversationId: string) => void;
  autoFocusInput?: boolean;
}

export function useChatSession({
  chatId,
  initialMessages,
  onMessagesChange,
  onChangeTitle,
  onConversationIdUpdate,
  learningPlanId,
}: {
  chatId: string | null;
  initialMessages: Array<AppUIMessage>;
  onMessagesChange: (hasMessages: boolean) => void;
  onChangeTitle?: (title: string) => void;
  onConversationIdUpdate?: (conversationId: string) => void;
  learningPlanId: string;
}) {
  const [input, setInput] = useState("");

  // useRef를 사용하여 최신 chatId를 항상 참조하도록 함 (클로저 문제 해결)
  const chatIdRef = useRef(chatId);
  chatIdRef.current = chatId;

  const { messages, sendMessage, status } = useChat<AppUIMessage>({
    messages: initialMessages,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: CHAT_STREAM_URL,
      credentials: "include",
      prepareSendMessagesRequest: (request) => ({
        body: {
          conversationId: chatIdRef.current, // ref를 통해 최신 값 참조
          learningPlanId,
          message: request.messages[request.messages.length - 1],
        },
      }),
    }),
    onFinish: (data) => {
      console.log("Chat stream onFinish", data.message);
      const metadata = data.message.metadata;
      const title = metadata?.title;
      const newConversationId = metadata?.conversationId;
      const isNewConversation = metadata?.isNewConversation;

      // 새 대화인 경우 서버에서 생성한 conversationId로 업데이트
      if (isNewConversation && newConversationId && onConversationIdUpdate) {
        onConversationIdUpdate(newConversationId);
      }

      if (title && onChangeTitle) {
        onChangeTitle(title);
      }
      chatbotLogger.debug("Chat stream finished", { chatId });
    },
    onError: (error: Error) => {
      chatbotLogger.error("AI chat error", error, { chatId });
    },
  });

  useEffect(() => {
    setInput("");
  }, [chatId]);

  useEffect(() => {
    onMessagesChange(messages.length > 0);
  }, [messages.length, onMessagesChange]);

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const text = message.text?.trim() ?? "";
      const hasText = Boolean(text);
      const hasFiles = Boolean(message.files?.length);

      if (!(hasText || hasFiles)) {
        return;
      }

      await sendMessage({
        text,
        files: message.files,
      });

      setInput("");
    },
    [sendMessage],
  );

  const isBusy = status === "submitted" || status === "streaming";

  return {
    messages,
    status,
    isBusy,
    input,
    setInput,
    handleSubmit,
  };
}

export function ChatView({
  learningPlanId,
  conversationId,
  initialMessages,
  onMessagesChange,
  onChangeTitle,
  onConversationIdUpdate,
  autoFocusInput = false,
}: ChatViewProps) {
  const { messages, status, isBusy, input, setInput, handleSubmit } =
    useChatSession({
      learningPlanId,
      chatId: conversationId,
      initialMessages,
      onMessagesChange,
      onChangeTitle,
      onConversationIdUpdate,
    });

  return (
    <>
      <Conversation className="h-full">
        <ConversationContent>
          {messages.map((message) => (
            <div key={message.id}>
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case "text":
                    return (
                      <Message
                        key={`${message.id}-${i}`}
                        from={message.role}
                      >
                        <MessageContent>
                          <MessageResponse>{part.text}</MessageResponse>
                        </MessageContent>
                        {message.role === "assistant" &&
                          i === messages.length - 1 && (
                            <MessageActions>
                              <MessageAction
                                onClick={() =>
                                  navigator.clipboard.writeText(part.text)
                                }
                                label="Copy"
                              >
                                <Icon
                                  name="solar--copy-outline"
                                  type="iconify"
                                />
                              </MessageAction>
                            </MessageActions>
                          )}
                      </Message>
                    );
                  case "reasoning":
                    return <span>생각중: {part.text}</span>;
                  case "tool-createModule":
                  case "tool-updateModule":
                  case "tool-deleteModule":
                  case "tool-listModules":
                  case "tool-createTask":
                  case "tool-updateTask":
                  case "tool-deleteTask":
                  case "tool-completeTasks":
                  case "tool-listTasks":
                  case "tool-bulkUpdateTasks":
                  case "tool-getProgress":
                  case "tool-getPlanDetails":
                  case "tool-getModuleDetails":
                    return (
                      <Tool>
                        <ToolHeader
                          type={part.type}
                          state={part.state}
                        />
                        <ToolContent>
                          <ToolInput input={part.input} />
                          <ToolOutput
                            output={part.output}
                            errorText={part.errorText}
                          />
                        </ToolContent>
                      </Tool>
                    );

                  default:
                    return null;
                }
              })}
            </div>
          ))}
          {isBusy && (
            <Icon
              name="solar--refresh-outline"
              type="iconify"
              className="animate-spin"
            />
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <PromptInput
        onSubmit={handleSubmit}
        className="mt-4"
        globalDrop
        multiple
      >
        <PromptInputHeader>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea
            aria-label="메시지 입력"
            placeholder="질문을 입력해 보세요..."
            autoFocus={autoFocusInput}
            onChange={(event) => setInput(event.currentTarget.value)}
            value={input}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuButton />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          </PromptInputTools>
          <PromptInputSubmit
            isDisabled={isBusy}
            status={status}
          />
        </PromptInputFooter>
      </PromptInput>
    </>
  );
}
