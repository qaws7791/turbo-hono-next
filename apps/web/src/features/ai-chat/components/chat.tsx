import { Button } from "@repo/ui/button";
import {
  Chatbot,
  ChatbotContent,
  ChatbotHeader,
  ChatbotHeaderActions,
  ChatbotHeaderBackButton,
  ChatbotHeaderTitle,
} from "@repo/ui/chatbot";
import { Icon } from "@repo/ui/icon";
import { useCallback, useState } from "react";

import type { AppUIMessage } from "@repo/ai-types";

import { api } from "@/api/http-client";
import { ChatView } from "@/features/ai-chat/components/chat-view";
import { HistoryOverlay } from "@/features/ai-chat/components/history-overlay";
import { useConversations } from "@/features/ai-chat/hooks";

export interface ChatProps {
  learningPlanId: string;
}

export function Chat({ learningPlanId }: ChatProps) {
  const [isOpen, setIsOpen] = useState(false); // 채팅 모달 열림 상태
  const [view, setView] = useState<"chat" | "history">("chat"); // 채팅 뷰
  const [sessionKey, setSessionKey] = useState<string>(() =>
    crypto.randomUUID(),
  ); // 컴포넌트 생명주기를 관리하기 위한 안정적인 키
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const [initialMessages, setInitialMessages] = useState<Array<AppUIMessage>>(
    [],
  );
  const [chatHasMessages, setChatHasMessages] = useState(false);
  const [titleResolved, setTitleResolved] = useState(false);
  const [chatTitle, setChatTitle] = useState<string>("새 대화");

  const conversations = useConversations(learningPlanId);

  const handleMessagesChange = useCallback((hasMessages: boolean) => {
    setChatHasMessages(hasMessages);
  }, []);

  const resetChatSession = useCallback(() => {
    setSessionKey(crypto.randomUUID()); // 새 세션 키 생성하여 컴포넌트 리마운트
    setConversationId(null); // conversationId는 서버에서 받을 때까지 null
    setInitialMessages([]);
    setChatHasMessages(false);
    setChatTitle("새 대화");
    setTitleResolved(false);
    setView("chat");
    setShouldFocusInput(true);
  }, []);

  const handleNewChat = useCallback(() => {
    if (!chatHasMessages && initialMessages.length === 0) {
      setView("chat");
      setShouldFocusInput(true);
      return;
    }

    resetChatSession();
  }, [chatHasMessages, initialMessages.length, resetChatSession]);

  const handleOpenHistory = useCallback(() => {
    setView("history");
    setShouldFocusInput(false);
  }, []);

  const handleCloseHistory = useCallback(() => {
    setView("chat");
    setShouldFocusInput(true);
  }, []);

  const handleChangeTitle = (title: string) => {
    if (!titleResolved) {
      setChatTitle(title);
      setTitleResolved(true);
    }
  };

  const handleConversationIdUpdate = useCallback(
    (newConversationId: string) => {
      setConversationId(newConversationId);
    },
    [],
  );

  const handleSelectHistoryChat = useCallback(async (id: string) => {
    try {
      const chat = await api.aiChat.getConversation(id);
      if (!chat.data) {
        console.error("선택한 대화를 찾을 수 없습니다.");
        return;
      }

      const title = chat.data.conversation.title || "untitled";
      const messages = chat.data?.messages as Array<AppUIMessage>;

      setSessionKey(crypto.randomUUID()); // 새 세션으로 전환하여 컴포넌트 리마운트
      setConversationId(id);
      setInitialMessages(messages);
      setChatHasMessages(messages.length > 0);
      setChatTitle(title);
      setTitleResolved(true);
      setView("chat");
      setShouldFocusInput(true);
    } catch (error) {
      console.error("Failed to load chat messages", error);
    }
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setShouldFocusInput(true);
    setView("chat");
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setView("chat");
  }, []);

  if (!isOpen) {
    return (
      <Button
        aria-expanded={isOpen}
        aria-label="AI 채팅 열기"
        className="fixed bottom-6 right-8 z-40 h-12 w-12 rounded-full shadow-lg"
        isIconOnly
        size="lg"
        onPress={openChat}
      >
        <Icon
          type="iconify"
          name="solar--chat-round-outline"
          className="h-6 w-6"
        />
      </Button>
    );
  }

  return (
    <div className="h-[700px] w-[400px] rounded-lg border border-border fixed bottom-6 right-8">
      <Chatbot>
        <ChatbotHeader>
          {view === "history" && (
            <ChatbotHeaderBackButton onPress={handleCloseHistory} />
          )}
          <ChatbotHeaderTitle>
            {view === "history" ? "채팅 기록" : chatTitle}
          </ChatbotHeaderTitle>
          <ChatbotHeaderActions>
            <Button
              isIconOnly
              aria-label="새로운 대화"
              variant="ghost"
              size="sm"
              onPress={handleNewChat}
            >
              <Icon
                name="solar--pen-new-square-outline"
                type="iconify"
              />
            </Button>
            <Button
              aria-label="채팅 기록 보기"
              isIconOnly
              variant="ghost"
              size="sm"
              onPress={handleOpenHistory}
            >
              <Icon
                name="solar--history-outline"
                type="iconify"
              />
            </Button>
            <Button
              aria-label="닫기"
              isIconOnly
              variant="ghost"
              size="sm"
              onPress={closeChat}
            >
              <Icon
                name="solar--close-circle-outline"
                type="iconify"
              />
            </Button>
          </ChatbotHeaderActions>
        </ChatbotHeader>

        <ChatbotContent>
          <ChatView
            key={sessionKey}
            learningPlanId={learningPlanId}
            conversationId={conversationId}
            initialMessages={initialMessages}
            onMessagesChange={handleMessagesChange}
            onChangeTitle={handleChangeTitle}
            onConversationIdUpdate={handleConversationIdUpdate}
            autoFocusInput={shouldFocusInput}
          />

          <HistoryOverlay
            isLoading={conversations.isLoading}
            histories={conversations.conversations}
            isVisible={view === "history"}
            onSelectChat={handleSelectHistoryChat}
          />
        </ChatbotContent>
      </Chatbot>
    </div>
  );
}
