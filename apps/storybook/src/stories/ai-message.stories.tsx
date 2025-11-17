import { CopyIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAttachment,
  MessageAttachments,
  MessageContent,
  MessageResponse,
  MessageToolbar,
} from "@repo/ui/ai";

import type { FileUIPart } from "ai";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Message components for displaying chat messages
 *
 * Features:
 * - Role-based styling (user/assistant)
 * - Markdown rendering with GFM support
 * - File attachments (images and documents)
 * - Action buttons with tooltips
 * - Accessible by default
 *
 * Based on AI SDK Message components:
 * @see https://ai-sdk.dev/elements/components/message
 */
const meta = {
  title: "AI/Message",
  component: Message,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic user message
 */
export const UserMessage: Story = {
  render: () => (
    <div className="w-[600px]">
      <Message from="user">
        <MessageContent>
          <MessageResponse>
            안녕하세요! React Hooks에 대해 알려주세요.
          </MessageResponse>
        </MessageContent>
      </Message>
    </div>
  ),
};

/**
 * Basic assistant message
 */
export const AssistantMessage: Story = {
  render: () => (
    <div className="w-[600px]">
      <Message from="assistant">
        <MessageContent>
          <MessageResponse>
            React Hooks는 함수 컴포넌트에서 상태와 생명주기 기능을 사용할 수
            있게 해주는 기능입니다.
          </MessageResponse>
        </MessageContent>
      </Message>
    </div>
  ),
};

/**
 * Message with markdown formatting
 */
export const WithMarkdown: Story = {
  render: () => (
    <div className="w-[600px]">
      <Message from="assistant">
        <MessageContent>
          <MessageResponse>
            {`React Hooks는 React 16.8에서 도입된 기능입니다.

## 주요 Hooks

1. **useState** - 상태 관리
2. **useEffect** - 사이드 이펙트 처리
3. **useContext** - 컨텍스트 사용

\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

> Hooks를 활용하면 클래스 컴포넌트 없이도 강력한 기능을 구현할 수 있습니다.`}
          </MessageResponse>
        </MessageContent>
      </Message>
    </div>
  ),
};

/**
 * Message with action buttons
 */
export const WithActions: Story = {
  render: () => (
    <div className="w-[600px]">
      <Message from="assistant">
        <MessageContent>
          <MessageResponse>
            React Hooks는 함수 컴포넌트에서 상태와 생명주기 기능을 사용할 수
            있게 해주는 기능입니다.
          </MessageResponse>
        </MessageContent>
        <MessageActions>
          <MessageAction
            aria-label="Copy message"
            tooltip="복사"
            onPress={() => alert("Copied!")}
          >
            <CopyIcon className="size-4" />
          </MessageAction>
          <MessageAction
            aria-label="Like message"
            tooltip="좋아요"
            onPress={() => alert("Liked!")}
          >
            <ThumbsUpIcon className="size-4" />
          </MessageAction>
          <MessageAction
            aria-label="Dislike message"
            tooltip="싫어요"
            onPress={() => alert("Disliked!")}
          >
            <ThumbsDownIcon className="size-4" />
          </MessageAction>
        </MessageActions>
      </Message>
    </div>
  ),
};

/**
 * Message with image attachment
 */
export const WithImageAttachment: Story = {
  render: () => {
    const imageAttachment: FileUIPart = {
      type: "file",
      filename: "react-diagram.png",
      url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=400&fit=crop",
      mediaType: "image/png",
    };

    return (
      <div className="w-[600px]">
        <Message from="user">
          <MessageAttachments>
            <MessageAttachment data={imageAttachment} />
          </MessageAttachments>
          <MessageContent>
            <MessageResponse>
              이 다이어그램에 대해 설명해주세요.
            </MessageResponse>
          </MessageContent>
        </Message>
      </div>
    );
  },
};

/**
 * Message with multiple image attachments
 */
export const WithMultipleImages: Story = {
  render: () => {
    const attachments: Array<FileUIPart> = [
      {
        type: "file",
        filename: "screenshot1.png",
        url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=400&fit=crop",
        mediaType: "image/png",
      },
      {
        type: "file",
        filename: "screenshot2.png",
        url: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=400&fit=crop",
        mediaType: "image/png",
      },
      {
        type: "file",
        filename: "screenshot3.png",
        url: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400&h=400&fit=crop",
        mediaType: "image/png",
      },
    ];

    return (
      <div className="w-[600px]">
        <Message from="user">
          <MessageAttachments>
            {attachments.map((attachment, index) => (
              <MessageAttachment
                key={index}
                data={attachment}
              />
            ))}
          </MessageAttachments>
          <MessageContent>
            <MessageResponse>이 화면들을 분석해주세요.</MessageResponse>
          </MessageContent>
        </Message>
      </div>
    );
  },
};

/**
 * Message with file attachment
 */
export const WithFileAttachment: Story = {
  render: () => {
    const fileAttachment: FileUIPart = {
      type: "file",
      filename: "requirements.pdf",
      mediaType: "application/pdf",
    };

    return (
      <div className="w-[600px]">
        <Message from="user">
          <MessageAttachments>
            <MessageAttachment data={fileAttachment} />
          </MessageAttachments>
          <MessageContent>
            <MessageResponse>이 문서를 검토해주세요.</MessageResponse>
          </MessageContent>
        </Message>
      </div>
    );
  },
};

/**
 * Message with removable attachments
 */
export const WithRemovableAttachments: Story = {
  render: () => {
    const attachments: Array<FileUIPart> = [
      {
        type: "file",
        filename: "image1.png",
        url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=400&fit=crop",
        mediaType: "image/png",
      },
      {
        type: "file",
        filename: "document.pdf",
        mediaType: "application/pdf",
      },
    ];

    return (
      <div className="w-[600px]">
        <Message from="user">
          <MessageAttachments>
            {attachments.map((attachment, index) => (
              <MessageAttachment
                key={index}
                data={attachment}
                onRemove={() => alert(`Removed ${attachment.filename}`)}
              />
            ))}
          </MessageAttachments>
          <MessageContent>
            <MessageResponse>이 파일들을 확인해주세요.</MessageResponse>
          </MessageContent>
        </Message>
      </div>
    );
  },
};

/**
 * Complete message with toolbar
 */
export const WithToolbar: Story = {
  render: () => (
    <div className="w-[600px]">
      <Message from="assistant">
        <MessageContent>
          <MessageResponse>
            {`React Hooks 학습 계획을 생성했습니다.

## 학습 목표
- useState와 useEffect 이해하기
- Custom Hooks 만들기
- 성능 최적화 방법 학습하기`}
          </MessageResponse>
        </MessageContent>
        <MessageToolbar>
          <MessageActions>
            <MessageAction
              tooltip="복사"
              onPress={() => alert("Copied!")}
            >
              <CopyIcon className="size-4" />
            </MessageAction>
            <MessageAction
              tooltip="좋아요"
              onPress={() => alert("Liked!")}
            >
              <ThumbsUpIcon className="size-4" />
            </MessageAction>
            <MessageAction
              tooltip="싫어요"
              onPress={() => alert("Disliked!")}
            >
              <ThumbsDownIcon className="size-4" />
            </MessageAction>
          </MessageActions>
          <span className="text-xs text-muted-foreground">2분 전</span>
        </MessageToolbar>
      </Message>
    </div>
  ),
};

/**
 * Conversation example with multiple messages
 */
export const Conversation: Story = {
  render: () => {
    const imageAttachment: FileUIPart = {
      type: "file",
      filename: "code-screenshot.png",
      url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=400&fit=crop",
      mediaType: "image/png",
    };

    return (
      <div className="w-[700px] space-y-6 p-4">
        <Message from="user">
          <MessageContent>
            <MessageResponse>React Hooks에 대해 알려주세요.</MessageResponse>
          </MessageContent>
        </Message>

        <Message from="assistant">
          <MessageContent>
            <MessageResponse>
              {`React Hooks는 React 16.8에서 도입된 기능으로, 함수 컴포넌트에서 상태와 생명주기 기능을 사용할 수 있게 해줍니다.

## 주요 Hooks

1. **useState** - 컴포넌트의 상태를 관리합니다
2. **useEffect** - 사이드 이펙트를 처리합니다
3. **useContext** - Context API를 사용합니다

\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\``}
            </MessageResponse>
          </MessageContent>
          <MessageActions>
            <MessageAction
              tooltip="복사"
              onPress={() => alert("Copied!")}
            >
              <CopyIcon className="size-4" />
            </MessageAction>
            <MessageAction
              tooltip="좋아요"
              onPress={() => alert("Liked!")}
            >
              <ThumbsUpIcon className="size-4" />
            </MessageAction>
          </MessageActions>
        </Message>

        <Message from="user">
          <MessageAttachments>
            <MessageAttachment data={imageAttachment} />
          </MessageAttachments>
          <MessageContent>
            <MessageResponse>이 코드를 설명해주세요.</MessageResponse>
          </MessageContent>
        </Message>

        <Message from="assistant">
          <MessageContent>
            <MessageResponse>
              {`이 코드는 useState Hook을 사용하여 카운터를 구현한 예시입니다. 버튼을 클릭할 때마다 상태가 업데이트됩니다.`}
            </MessageResponse>
          </MessageContent>
          <MessageToolbar>
            <MessageActions>
              <MessageAction
                tooltip="복사"
                onPress={() => alert("Copied!")}
              >
                <CopyIcon className="size-4" />
              </MessageAction>
              <MessageAction
                tooltip="좋아요"
                onPress={() => alert("Liked!")}
              >
                <ThumbsUpIcon className="size-4" />
              </MessageAction>
            </MessageActions>
            <span className="text-xs text-muted-foreground">방금 전</span>
          </MessageToolbar>
        </Message>
      </div>
    );
  },
};

/**
 * Long message with code blocks
 */
export const LongCodeMessage: Story = {
  render: () => (
    <div className="w-[700px]">
      <Message from="assistant">
        <MessageContent>
          <MessageResponse>
            {`# React Hooks 완전 가이드

React Hooks는 함수 컴포넌트에서 React의 기능들을 사용할 수 있게 해주는 API입니다.

## useState Hook

가장 기본적인 Hook으로, 컴포넌트의 상태를 관리합니다.

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        증가
      </button>
    </div>
  );
}
\`\`\`

## useEffect Hook

사이드 이펙트를 처리하는 Hook입니다.

\`\`\`jsx
import { useEffect, useState } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}
\`\`\`

## 규칙

1. 최상위 레벨에서만 Hook을 호출하세요
2. React 함수 컴포넌트나 커스텀 Hook에서만 호출하세요
3. 조건문이나 반복문 안에서 호출하지 마세요

> **참고**: 이러한 규칙을 따르면 컴포넌트가 렌더링될 때마다 동일한 순서로 Hook이 호출됩니다.`}
          </MessageResponse>
        </MessageContent>
        <MessageToolbar>
          <MessageActions>
            <MessageAction
              tooltip="복사"
              onPress={() => alert("Copied!")}
            >
              <CopyIcon className="size-4" />
            </MessageAction>
            <MessageAction
              tooltip="좋아요"
              onPress={() => alert("Liked!")}
            >
              <ThumbsUpIcon className="size-4" />
            </MessageAction>
            <MessageAction
              tooltip="싫어요"
              onPress={() => alert("Disliked!")}
            >
              <ThumbsDownIcon className="size-4" />
            </MessageAction>
          </MessageActions>
          <span className="text-xs text-muted-foreground">5분 전</span>
        </MessageToolbar>
      </Message>
    </div>
  ),
};
