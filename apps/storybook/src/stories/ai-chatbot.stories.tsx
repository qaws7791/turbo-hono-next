import {
  Chatbot,
  ChatbotContent,
  ChatbotHeader,
  ChatbotHeaderActions,
  ChatbotHeaderBackButton,
  ChatbotHeaderTitle,
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
  History,
  HistoryContent,
  HistoryGroup,
  HistoryItem,
  HistoryItemMenuTrigger,
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
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@repo/ui/ai";
import { Button } from "@repo/ui/button";
import { Menu, MenuItem, MenuPopover } from "@repo/ui/menu";
import {
  ClockIcon,
  CopyIcon,
  EditIcon,
  MessageSquareIcon,
  RefreshCwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";

import type { PromptInputMessage } from "@repo/ui/ai";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Chatbot is the main container component for building AI chat interfaces.
 *
 * Features:
 * - Full-height chat layout with header, content, and input areas
 * - Support for chat view and history view modes
 * - Composable subcomponents for flexible layouts
 * - Responsive design with proper overflow handling
 * - Accessible by default
 *
 * The Chatbot component provides the overall structure while allowing
 * you to compose different parts (Header, Content, Conversation, History, PromptInput)
 * to build your chat interface.
 */
const meta = {
  title: "AI/Chatbot",
  component: Chatbot,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Chatbot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic chatbot structure with header and empty content
 */
export const Basic: Story = {
  render: () => (
    <div className="h-[600px] w-[400px] rounded-lg border border-border">
      <Chatbot>
        <ChatbotHeader>
          <ChatbotHeaderTitle>New Chat</ChatbotHeaderTitle>
          <ChatbotHeaderActions>
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
            >
              <EditIcon />
            </Button>
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
            >
              <ClockIcon />
            </Button>
          </ChatbotHeaderActions>
        </ChatbotHeader>
        <ChatbotContent>
          <Conversation>
            <ConversationEmptyState
              title="Start a conversation"
              description="Ask me anything to get started!"
              icon={<MessageSquareIcon className="size-12" />}
            />
          </Conversation>
        </ChatbotContent>
      </Chatbot>
    </div>
  ),
};

/**
 * Chat view with conversation messages and prompt input
 */
export const ChatView: Story = {
  render: () => (
    <div className="h-[700px] w-[400px] rounded-lg border border-border">
      <Chatbot>
        <ChatbotHeader>
          <ChatbotHeaderTitle>ChatKit Overview</ChatbotHeaderTitle>
          <ChatbotHeaderActions>
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              aria-label="Edit"
            >
              <EditIcon />
            </Button>
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              aria-label="History"
            >
              <ClockIcon />
            </Button>
          </ChatbotHeaderActions>
        </ChatbotHeader>
        <ChatbotContent>
          <Conversation>
            <ConversationContent>
              <Message from="user">
                <MessageContent>
                  <MessageResponse>What is ChatKit?</MessageResponse>
                </MessageContent>
              </Message>

              <Message from="assistant">
                <MessageContent>
                  <MessageResponse>
                    {`ChatKit is a flexible UI library designed for building chat interfaces, such as chatbots and messaging apps, with customizable components and seamless integration into your web or app projects. It provides ready-made widgets (like chat bubbles, user lists, and more) that are easy to use and style, speeding up development time for chat-related features.

If you want to see it in action, I can show you a demo of a sample widget! Would you like that?`}
                  </MessageResponse>
                </MessageContent>
                <MessageActions>
                  <MessageAction tooltip="Copy">
                    <CopyIcon />
                  </MessageAction>
                  <MessageAction tooltip="Like">
                    <ThumbsUpIcon />
                  </MessageAction>
                  <MessageAction tooltip="Dislike">
                    <ThumbsDownIcon />
                  </MessageAction>
                  <MessageAction tooltip="Regenerate">
                    <RefreshCwIcon />
                  </MessageAction>
                </MessageActions>
              </Message>
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="shrink-0 p-4">
            <PromptInput
              onSubmit={(message) => {
                console.log("Submitted:", message);
              }}
            >
              <PromptInputHeader>
                <PromptInputAttachments>
                  {(attachment) => <PromptInputAttachment data={attachment} />}
                </PromptInputAttachments>
              </PromptInputHeader>

              <PromptInputBody>
                <PromptInputTextarea placeholder="AI에게 메시지" />
              </PromptInputBody>

              <PromptInputFooter>
                <PromptInputTools>
                  <PromptInputActionMenu>
                    <PromptInputActionMenuButton />
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                  <PromptInputSelect defaultSelectedKey="gpt-5">
                    <PromptInputSelectTrigger>
                      <PromptInputSelectValue />
                    </PromptInputSelectTrigger>
                    <PromptInputSelectContent>
                      <PromptInputSelectItem id="gpt-5">
                        gpt-5
                      </PromptInputSelectItem>
                      <PromptInputSelectItem id="gpt-4o">
                        gpt-4o
                      </PromptInputSelectItem>
                      <PromptInputSelectItem id="claude-opus">
                        claude-opus
                      </PromptInputSelectItem>
                    </PromptInputSelectContent>
                  </PromptInputSelect>
                </PromptInputTools>
                <PromptInputSubmit />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </ChatbotContent>
      </Chatbot>
    </div>
  ),
};

/**
 * History view showing past conversations
 */
export const HistoryView: Story = {
  render: () => (
    <div className="h-[700px] w-[400px] rounded-lg border border-border">
      <Chatbot>
        <ChatbotHeader>
          <ChatbotHeaderBackButton onPress={() => alert("Go back")} />
          <ChatbotHeaderTitle>채팅 기록</ChatbotHeaderTitle>
          <ChatbotHeaderActions>
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              aria-label="Edit"
            >
              <EditIcon />
            </Button>
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              aria-label="History"
            >
              <ClockIcon />
            </Button>
          </ChatbotHeaderActions>
        </ChatbotHeader>

        <div className="flex shrink-0 items-center gap-2 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            className="gap-2 justify-start pl-2"
          >
            <EditIcon />새 대화
          </Button>
        </div>

        <History className="flex-1">
          <HistoryContent>
            <HistoryGroup label="오늘">
              <HistoryItem
                selected
                onClick={() => alert("ChatKit Overview selected")}
                menu={
                  <HistoryItemMenuTrigger>
                    <MenuPopover>
                      <Menu>
                        <MenuItem onAction={() => alert("Rename")}>
                          <EditIcon />
                          이름 바꾸기
                        </MenuItem>
                        <MenuItem
                          onAction={() => alert("Delete")}
                          className="text-destructive data-[focused]:text-destructive"
                        >
                          <Trash2Icon />
                          삭제
                        </MenuItem>
                      </Menu>
                    </MenuPopover>
                  </HistoryItemMenuTrigger>
                }
              >
                ChatKit Overview
              </HistoryItem>
            </HistoryGroup>

            <HistoryGroup label="어제">
              <HistoryItem
                onClick={() => alert("React Hooks selected")}
                menu={
                  <HistoryItemMenuTrigger>
                    <MenuPopover>
                      <Menu>
                        <MenuItem onAction={() => alert("Rename")}>
                          <EditIcon />
                          이름 바꾸기
                        </MenuItem>
                        <MenuItem
                          onAction={() => alert("Delete")}
                          className="text-destructive data-[focused]:text-destructive"
                        >
                          <Trash2Icon />
                          삭제
                        </MenuItem>
                      </Menu>
                    </MenuPopover>
                  </HistoryItemMenuTrigger>
                }
              >
                React Hooks 학습하기
              </HistoryItem>
              <HistoryItem
                onClick={() => alert("TypeScript selected")}
                menu={
                  <HistoryItemMenuTrigger>
                    <MenuPopover>
                      <Menu>
                        <MenuItem onAction={() => alert("Rename")}>
                          <EditIcon />
                          이름 바꾸기
                        </MenuItem>
                        <MenuItem
                          onAction={() => alert("Delete")}
                          className="text-destructive data-[focused]:text-destructive"
                        >
                          <Trash2Icon />
                          삭제
                        </MenuItem>
                      </Menu>
                    </MenuPopover>
                  </HistoryItemMenuTrigger>
                }
              >
                TypeScript 베스트 프랙티스
              </HistoryItem>
            </HistoryGroup>

            <HistoryGroup label="지난 7일">
              <HistoryItem onClick={() => alert("Next.js selected")}>
                Next.js 프로젝트 설정
              </HistoryItem>
              <HistoryItem onClick={() => alert("Database selected")}>
                데이터베이스 스키마 설계
              </HistoryItem>
            </HistoryGroup>
          </HistoryContent>
        </History>
      </Chatbot>
    </div>
  ),
};

/**
 * Empty state when starting a new conversation
 */
export const EmptyState: Story = {
  render: () => (
    <div className="h-[600px] w-[400px] rounded-lg border border-border">
      <Chatbot>
        <ChatbotHeader>
          <ChatbotHeaderTitle>New Chat</ChatbotHeaderTitle>
          <ChatbotHeaderActions>
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
            >
              <ClockIcon />
            </Button>
          </ChatbotHeaderActions>
        </ChatbotHeader>
        <ChatbotContent>
          <Conversation>
            <ConversationEmptyState
              title="무엇을 도와드릴까요?"
              description="질문을 입력하거나 아래 예시 중 하나를 선택하세요."
              icon={<MessageSquareIcon className="size-12" />}
            >
              <div className="mt-4 flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="justify-start"
                >
                  💡 React Hooks 설명해줘
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                >
                  📝 이력서 작성 도와줘
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                >
                  🎯 프로젝트 아이디어 추천
                </Button>
              </div>
            </ConversationEmptyState>
          </Conversation>

          <div className="shrink-0 p-4">
            <PromptInput
              onSubmit={(message) => {
                console.log("Submitted:", message);
              }}
            >
              <PromptInputBody>
                <PromptInputTextarea placeholder="메시지를 입력하세요..." />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools />
                <PromptInputSubmit />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </ChatbotContent>
      </Chatbot>
    </div>
  ),
};

/**
 * Long conversation with scrolling
 */
export const LongConversation: Story = {
  render: () => (
    <div className="h-[600px] w-[400px] rounded-lg border border-border">
      <Chatbot>
        <ChatbotHeader>
          <ChatbotHeaderTitle>긴 대화 예시</ChatbotHeaderTitle>
          <ChatbotHeaderActions>
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
            >
              <ClockIcon />
            </Button>
          </ChatbotHeaderActions>
        </ChatbotHeader>
        <ChatbotContent>
          <Conversation>
            <ConversationContent>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <Message from="user">
                    <MessageContent>
                      <MessageResponse>{`질문 ${i}: 이것은 테스트 메시지입니다.`}</MessageResponse>
                    </MessageContent>
                  </Message>
                  <Message from="assistant">
                    <MessageContent>
                      <MessageResponse>
                        {`답변 ${i}: 네, 이해했습니다. 이것은 긴 대화를 테스트하기 위한 예시 응답입니다. 스크롤이 제대로 작동하는지 확인할 수 있습니다.`}
                      </MessageResponse>
                    </MessageContent>
                  </Message>
                </div>
              ))}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="shrink-0 p-4">
            <PromptInput
              onSubmit={(message) => {
                console.log("Submitted:", message);
              }}
            >
              <PromptInputBody>
                <PromptInputTextarea placeholder="메시지를 입력하세요..." />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools />
                <PromptInputSubmit />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </ChatbotContent>
      </Chatbot>
    </div>
  ),
};

/**
 * Interactive example with view switching between chat and history
 */
export const Interactive: Story = {
  render: function InteractiveChatbot() {
    const [view, setView] = useState<"chat" | "history">("chat");
    const [selectedChatId, setSelectedChatId] = useState<string>("1");
    const [messages, setMessages] = useState<
      Array<{ role: "user" | "assistant"; text: string }>
    >([{ role: "assistant", text: "안녕하세요! 무엇을 도와드릴까요?" }]);
    const [isLoading, setIsLoading] = useState(false);

    const chats = [
      { id: "1", title: "ChatKit Overview", group: "오늘" },
      { id: "2", title: "React Hooks 학습하기", group: "오늘" },
      { id: "3", title: "TypeScript 베스트 프랙티스", group: "어제" },
    ];

    const handleSubmit = (message: PromptInputMessage) => {
      if (!message.text.trim()) return;

      setMessages((prev) => [...prev, { role: "user", text: message.text }]);
      setIsLoading(true);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `"${message.text}"에 대한 응답입니다. 더 궁금한 점이 있으시면 말씀해주세요!`,
          },
        ]);
        setIsLoading(false);
      }, 1000);
    };

    const handleSelectChat = (chatId: string) => {
      setSelectedChatId(chatId);
      setView("chat");
      // In a real app, you would load the chat messages here
      const chat = chats.find((c) => c.id === chatId);
      setMessages([
        {
          role: "assistant",
          text: `"${chat?.title}" 대화를 불러왔습니다. 계속 질문해주세요!`,
        },
      ]);
    };

    if (view === "history") {
      return (
        <div className="h-[700px] w-[400px] rounded-lg border border-border">
          <Chatbot>
            <ChatbotHeader>
              <ChatbotHeaderBackButton onPress={() => setView("chat")} />
              <ChatbotHeaderTitle>채팅 기록</ChatbotHeaderTitle>
              <ChatbotHeaderActions>
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                >
                  <EditIcon />
                </Button>
              </ChatbotHeaderActions>
            </ChatbotHeader>

            <div className="flex shrink-0 items-center gap-2 px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 justify-start pl-2"
                fullWidth
                onPress={() => {
                  setMessages([
                    {
                      role: "assistant",
                      text: "새 대화를 시작합니다. 무엇을 도와드릴까요?",
                    },
                  ]);
                  setView("chat");
                }}
              >
                <EditIcon />새 대화
              </Button>
            </div>

            <History className="flex-1">
              <HistoryContent>
                <HistoryGroup label="오늘">
                  {chats
                    .filter((c) => c.group === "오늘")
                    .map((chat) => (
                      <HistoryItem
                        key={chat.id}
                        selected={selectedChatId === chat.id}
                        onClick={() => handleSelectChat(chat.id)}
                      >
                        {chat.title}
                      </HistoryItem>
                    ))}
                </HistoryGroup>
                <HistoryGroup label="어제">
                  {chats
                    .filter((c) => c.group === "어제")
                    .map((chat) => (
                      <HistoryItem
                        key={chat.id}
                        selected={selectedChatId === chat.id}
                        onClick={() => handleSelectChat(chat.id)}
                      >
                        {chat.title}
                      </HistoryItem>
                    ))}
                </HistoryGroup>
              </HistoryContent>
            </History>
          </Chatbot>
        </div>
      );
    }

    return (
      <div className="h-[700px] w-[400px] rounded-lg border border-border">
        <Chatbot>
          <ChatbotHeader>
            <ChatbotHeaderTitle>
              {chats.find((c) => c.id === selectedChatId)?.title || "New Chat"}
            </ChatbotHeaderTitle>
            <ChatbotHeaderActions>
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                aria-label="Edit"
              >
                <EditIcon />
              </Button>
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                aria-label="History"
                onPress={() => setView("history")}
              >
                <ClockIcon />
              </Button>
            </ChatbotHeaderActions>
          </ChatbotHeader>
          <ChatbotContent>
            <Conversation>
              <ConversationContent>
                {messages.map((msg, idx) => (
                  <Message
                    key={idx}
                    from={msg.role}
                  >
                    <MessageContent>
                      <MessageResponse>{msg.text}</MessageResponse>
                    </MessageContent>
                  </Message>
                ))}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <div className="shrink-0 p-4">
              <PromptInput onSubmit={handleSubmit}>
                <PromptInputBody>
                  <PromptInputTextarea
                    placeholder="메시지를 입력하세요..."
                    disabled={isLoading}
                  />
                </PromptInputBody>
                <PromptInputFooter>
                  <PromptInputTools />
                  <PromptInputSubmit
                    isDisabled={isLoading}
                    status={isLoading ? "submitted" : undefined}
                  />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </ChatbotContent>
        </Chatbot>
      </div>
    );
  },
};

/**
 * Side-by-side comparison of chat and history views
 */
export const SideBySide: Story = {
  render: () => (
    <div className="flex gap-4">
      {/* Chat View */}
      <div className="h-[600px] w-[360px] rounded-lg border border-border">
        <Chatbot>
          <ChatbotHeader>
            <ChatbotHeaderTitle>ChatKit Overview</ChatbotHeaderTitle>
            <ChatbotHeaderActions>
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
              >
                <EditIcon />
              </Button>
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
              >
                <ClockIcon />
              </Button>
            </ChatbotHeaderActions>
          </ChatbotHeader>
          <ChatbotContent>
            <Conversation>
              <ConversationContent>
                <Message from="user">
                  <MessageContent>
                    <MessageResponse>What is ChatKit?</MessageResponse>
                  </MessageContent>
                </Message>
                <Message from="assistant">
                  <MessageContent>
                    <MessageResponse>
                      ChatKit is a flexible UI library for building chat
                      interfaces.
                    </MessageResponse>
                  </MessageContent>
                </Message>
              </ConversationContent>
            </Conversation>

            <div className="shrink-0 p-4">
              <PromptInput onSubmit={() => {}}>
                <PromptInputBody>
                  <PromptInputTextarea placeholder="AI에게 메시지" />
                </PromptInputBody>
                <PromptInputFooter>
                  <PromptInputTools />
                  <PromptInputSubmit />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </ChatbotContent>
        </Chatbot>
      </div>

      {/* History View */}
      <div className="h-[600px] w-[360px] rounded-lg border border-border">
        <Chatbot>
          <ChatbotHeader>
            <ChatbotHeaderBackButton />
            <ChatbotHeaderTitle>채팅 기록</ChatbotHeaderTitle>
            <ChatbotHeaderActions>
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
              >
                <EditIcon />
              </Button>
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
              >
                <ClockIcon />
              </Button>
            </ChatbotHeaderActions>
          </ChatbotHeader>

          <div className="flex shrink-0 items-center gap-2 px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 justify-start pl-2"
              fullWidth
            >
              <EditIcon />새 대화
            </Button>
          </div>

          <History className="flex-1">
            <HistoryContent>
              <HistoryGroup label="오늘">
                <HistoryItem selected>ChatKit Overview</HistoryItem>
              </HistoryGroup>
              <HistoryGroup label="어제">
                <HistoryItem>React Hooks 학습하기</HistoryItem>
                <HistoryItem>TypeScript 베스트 프랙티스</HistoryItem>
              </HistoryGroup>
            </HistoryContent>
          </History>
        </Chatbot>
      </div>
    </div>
  ),
};

/**
 * Chatbot with custom styling
 */
export const CustomStyling: Story = {
  render: () => (
    <div className="h-[600px] w-[400px] overflow-hidden rounded-2xl border-2 border-primary/20 shadow-xl">
      <Chatbot className="bg-gradient-to-b from-background to-muted/30">
        <ChatbotHeader className="border-b-2 border-primary/20 bg-primary/5">
          <ChatbotHeaderTitle className="font-bold text-primary">
            🤖 AI Assistant
          </ChatbotHeaderTitle>
          <ChatbotHeaderActions>
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/10"
            >
              <ClockIcon />
            </Button>
          </ChatbotHeaderActions>
        </ChatbotHeader>
        <ChatbotContent>
          <Conversation>
            <ConversationContent>
              <Message from="assistant">
                <MessageContent>
                  <MessageResponse>
                    Welcome! I&apos;m your AI assistant with custom styling. How
                    can I help you today?
                  </MessageResponse>
                </MessageContent>
              </Message>
            </ConversationContent>
          </Conversation>

          <div className="shrink-0 border-t-2 border-primary/20 bg-primary/5 p-4">
            <PromptInput
              onSubmit={() => {}}
              className="rounded-xl border-2 border-primary/30"
            >
              <PromptInputBody>
                <PromptInputTextarea placeholder="Ask me anything..." />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools />
                <PromptInputSubmit className="bg-primary hover:bg-primary/90" />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </ChatbotContent>
      </Chatbot>
    </div>
  ),
};
