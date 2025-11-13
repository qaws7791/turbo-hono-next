# AI 튜터 채팅 기능 구현 계획

## 문서 정보

- **작성일**: 2025-11-13
- **버전**: 1.0
- **상태**: 설계 초안
- **목표**: 학습 계획 상세 페이지에 AI 튜터 채팅 기능 추가

---

## 1. 개요

### 1.1 기능 요약

학습 계획 상세 페이지에서 사용자가 AI 튜터와 대화하며 학습 계획을 관리할 수 있는 대화형 인터페이스를 제공합니다. AI는 학습 계획의 컨텍스트를 이해하고, Tool Calling을 통해 학습 모듈, 태스크 등을 직접 생성/수정/삭제할 수 있습니다.

### 1.2 핵심 기능 목록

#### 사용자 스토리 (6개)

| ID   | 사용자 스토리          | 설명                                                                |
| ---- | ---------------------- | ------------------------------------------------------------------- |
| US-1 | 학습 계획 질의응답     | 현재 학습 계획에 대해 질문하고 조언을 받을 수 있다                  |
| US-2 | 학습 모듈 추가/수정    | "React Hooks 모듈을 추가해줘"와 같은 요청으로 모듈을 관리할 수 있다 |
| US-3 | 학습 진도 분석 및 조언 | 현재 진도를 분석하고 다음 단계를 추천받을 수 있다                   |
| US-4 | 학습 태스크 일괄 관리  | "완료한 태스크들을 모두 체크해줘"와 같은 일괄 작업을 요청할 수 있다 |
| US-5 | 맞춤형 학습 자료 추천  | 현재 학습 단계에 맞는 자료를 추천받을 수 있다                       |
| US-6 | 학습 계획 재조정       | "주 5시간으로 계획을 조정해줘"와 같이 전체 계획을 수정할 수 있다    |

#### 핵심 기능 (9개)

| ID   | 기능명                  | 설명                                         | 우선순위 |
| ---- | ----------------------- | -------------------------------------------- | -------- |
| F-01 | 대화형 인터페이스       | 스트리밍 응답과 메시지 히스토리를 포함한 UI  | P0       |
| F-02 | 학습 계획 컨텍스트 인식 | 현재 학습 계획의 모든 정보를 컨텍스트로 제공 | P0       |
| F-03 | Tool: 학습 모듈 관리    | 모듈 생성, 수정, 삭제 도구                   | P0       |
| F-04 | Tool: 학습 태스크 관리  | 태스크 CRUD 및 일괄 수정 도구                | P0       |
| F-05 | Tool: 학습 계획 수정    | 학습 계획 메타데이터 수정 도구               | P1       |
| F-06 | Tool: 정보 조회         | 진도, 모듈 목록, 태스크 상세 조회 도구       | P0       |
| F-07 | 대화 히스토리 관리      | 대화 세션 및 메시지 저장/조회                | P1       |
| F-08 | 스트리밍 응답           | 실시간 응답 스트리밍으로 UX 개선             | P0       |
| F-09 | 에러 핸들링             | Tool 실행 실패 시 사용자 친화적 에러 메시지  | P0       |

### 1.3 기술 스택

- **AI SDK**: Vercel AI SDK v5 (`streamText`, `tool` API)
- **AI Model**: Google Gemini 2.5 Flash Lite (기존 `geminiModel` 재사용)
- **Backend**: Hono.js + OpenAPI
- **Frontend**: React 19 + TanStack Query + Zustand
- **UI Components**: React Aria Components + 커스텀 채팅 컴포넌트 (`packages/ui/src/ai`)

---

## 2. 아키텍처 설계

### 2.1 전체 흐름도

```
[Frontend]                [Backend API]              [Vercel AI SDK]
   |                           |                            |
   | POST /api/chat/stream     |                            |
   |-------------------------->|                            |
   |                           | 1. 학습 계획 컨텍스트 로드  |
   |                           | 2. streamText() 호출       |
   |                           |--------------------------->|
   |                           |                            | 3. Tool Calling
   |                           |<---------------------------|    (if needed)
   |                           | 4. Tool 실행               |
   |                           |    (모듈/태스크 CRUD)      |
   |                           | 5. Tool 결과 전달          |
   |                           |--------------------------->|
   | <-- SSE 스트림            |<---------------------------|
   | 6. UI 실시간 업데이트     |                            |
   |                           | 7. 히스토리 저장           |
```

### 2.2 레이어별 구조

#### 2.2.1 데이터베이스 레이어 (`packages/database`)

**새로 추가할 테이블**: `aiConversation`, `aiMessage`

```typescript
// packages/database/src/schema.ts

// 대화 세션 테이블
export const aiConversation = pgTable("aiConversation", {
  id: text("id").primaryKey(),
  learningPlanId: text("learningPlanId")
    .notNull()
    .references(() => learningPlan.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title"), // 대화 제목 (옵션, AI가 첫 메시지 기반으로 자동 생성 가능)
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type AIConversation = typeof aiConversation.$inferSelect;
export type NewAIConversation = typeof aiConversation.$inferInsert;

// 대화 메시지 테이블
export const aiMessage = pgTable("aiMessage", {
  id: text("id").primaryKey(),
  conversationId: text("conversationId")
    .notNull()
    .references(() => aiConversation.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant' | 'tool'
  content: text("content").notNull(),
  toolInvocations: jsonb("toolInvocations"), // ToolInvocation[]
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type AIMessage = typeof aiMessage.$inferSelect;
export type NewAIMessage = typeof aiMessage.$inferInsert;
```

**관계**:

- `aiConversation`:
  - `learningPlanId`: 학습 계획과 1:N 관계 (한 학습 계획은 여러 대화 세션을 가질 수 있음)
  - `userId`: 사용자와 1:N 관계 (cascade delete)
- `aiMessage`:
  - `conversationId`: 대화 세션과 1:N 관계 (한 대화 세션은 여러 메시지를 가질 수 있음, cascade delete)

**인덱스** (성능 최적화):

```typescript
// 학습 계획별 대화 세션 조회 최적화
export const aiConversationLearningPlanIdIdx = index(
  "aiConversation_learningPlanId_idx",
).on(aiConversation.learningPlanId);

// 대화 세션별 메시지 조회 최적화 (최신순 정렬 포함)
export const aiMessageConversationIdIdx = index(
  "aiMessage_conversationId_createdAt_idx",
).on(aiMessage.conversationId, aiMessage.createdAt.desc());
```

#### 2.2.2 API 스펙 레이어 (`packages/api-spec`)

**디렉토리 구조**:

```
packages/api-spec/src/modules/ai-chat/
├── schema.ts          # Zod schemas
├── routes.ts          # OpenAPI route definitions
└── routes/
    └── index.ts       # Route registrations
```

**주요 스키마** (`schema.ts`):

```typescript
import { z } from "zod";

// 메시지 스키마
export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: z.enum(["user", "assistant", "tool"]),
  content: z.string(),
  toolInvocations: z.array(z.any()).optional(), // Vercel AI SDK ToolInvocation 타입
  createdAt: z.string(), // ISO 8601 timestamp
});

// 대화 세션 스키마
export const ConversationSchema = z.object({
  id: z.string(),
  learningPlanId: z.string(),
  userId: z.string(),
  title: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 대화 세션 목록 조회 응답
export const ConversationListResponseSchema = z.object({
  conversations: z.array(ConversationSchema),
  totalCount: z.number(),
});

// 메시지 전송 요청 스키마
export const SendMessageRequestSchema = z.object({
  conversationId: z.string().optional(), // 없으면 새 대화 세션 생성
  learningPlanId: z.string(), // conversationId가 없을 때 필수
  message: z.string().min(1).max(5000),
});

// 메시지 목록 조회 응답
export const MessageListResponseSchema = z.object({
  messages: z.array(MessageSchema),
  totalCount: z.number(),
});
```

**주요 라우트** (`routes.ts`):

```typescript
import { createRoute } from "@hono/zod-openapi";

// POST /api/chat/stream - 스트리밍 메시지 전송 (SSE)
export const streamMessageRoute = createRoute({
  method: "post",
  path: "/chat/stream",
  tags: ["AI Chat"],
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: SendMessageRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "스트리밍 응답 (SSE)",
      content: {
        "text/event-stream": {
          schema: z.any(), // SSE 스트림
        },
      },
    },
    ...
  },
});

// GET /api/chat/conversations - 학습 계획의 대화 세션 목록 조회
export const getConversationsRoute = createRoute({
  method: "get",
  path: "/chat/conversations",
  tags: ["AI Chat"],
  security: [{ cookieAuth: [] }],
  request: {
    query: z.object({
      learningPlanId: z.string(),
    }),
  },
  responses: {
    200: {
      description: "대화 세션 목록",
      content: {
        "application/json": {
          schema: ConversationListResponseSchema,
        },
      },
    },
    ...
  },
});

// GET /api/chat/conversations/:conversationId/messages - 대화 세션의 메시지 목록 조회
export const getMessagesRoute = createRoute({
  method: "get",
  path: "/chat/conversations/{conversationId}/messages",
  tags: ["AI Chat"],
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({
      conversationId: z.string(),
    }),
  },
  responses: {
    200: {
      description: "메시지 목록",
      content: {
        "application/json": {
          schema: MessageListResponseSchema,
        },
      },
    },
    ...
  },
});

// POST /api/chat/conversations - 새 대화 세션 생성
export const createConversationRoute = createRoute({
  method: "post",
  path: "/chat/conversations",
  tags: ["AI Chat"],
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            learningPlanId: z.string(),
            title: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "생성된 대화 세션",
      content: {
        "application/json": {
          schema: ConversationSchema,
        },
      },
    },
    ...
  },
});

// DELETE /api/chat/conversations/:conversationId - 대화 세션 삭제
export const deleteConversationRoute = createRoute({
  method: "delete",
  path: "/chat/conversations/{conversationId}",
  tags: ["AI Chat"],
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({
      conversationId: z.string(),
    }),
  },
  responses: {
    204: {
      description: "삭제 완료",
    },
    ...
  },
});
```

#### 2.2.3 백엔드 레이어 (`apps/api`)

**디렉토리 구조**:

```
apps/api/src/modules/ai-chat/
├── routes/
│   ├── index.ts                        # Route handler 등록
│   ├── stream-message.handler.ts       # 스트리밍 메시지 전송 핸들러
│   ├── get-conversations.handler.ts    # 대화 세션 목록 조회 핸들러
│   ├── get-messages.handler.ts         # 메시지 목록 조회 핸들러
│   ├── create-conversation.handler.ts  # 대화 세션 생성 핸들러
│   └── delete-conversation.handler.ts  # 대화 세션 삭제 핸들러
├── services/
│   ├── conversation-command.service.ts # 대화 세션 생성/삭제
│   ├── conversation-query.service.ts   # 대화 세션 조회
│   ├── message-command.service.ts      # 메시지 저장
│   └── message-query.service.ts        # 메시지 조회
├── repositories/
│   ├── conversation.repository.ts      # 대화 세션 데이터 접근
│   └── message.repository.ts           # 메시지 데이터 접근
└── tools/
    ├── learning-module.tool.ts         # 학습 모듈 관리 도구
    ├── learning-task.tool.ts           # 학습 태스크 관리 도구
    ├── learning-plan.tool.ts           # 학습 계획 수정 도구
    └── query-info.tool.ts              # 정보 조회 도구
```

**Tool 정의 예시** (`tools/learning-module.tool.ts`):

```typescript
import { tool } from "ai";
import { z } from "zod";

export const createModuleTool = tool({
  description: "학습 모듈을 생성합니다",
  parameters: z.object({
    learningPlanId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    orderIndex: z.number().optional(),
  }),
  execute: async ({ learningPlanId, title, description, orderIndex }) => {
    // 1. 권한 확인
    // 2. 모듈 생성 (서비스 호출)
    // 3. 결과 반환
    return {
      success: true,
      moduleId: "...",
      message: `"${title}" 모듈을 생성했습니다.`,
    };
  },
});

export const updateModuleTool = tool({
  description: "학습 모듈을 수정합니다",
  parameters: z.object({
    moduleId: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    orderIndex: z.number().optional(),
  }),
  execute: async ({ moduleId, ...updates }) => {
    // 모듈 수정 로직
  },
});

export const deleteModuleTool = tool({
  description: "학습 모듈을 삭제합니다",
  parameters: z.object({
    moduleId: z.string(),
  }),
  execute: async ({ moduleId }) => {
    // 모듈 삭제 로직
  },
});
```

**스트리밍 핸들러 예시** (`routes/stream-message.handler.ts`):

```typescript
import { streamText } from "ai";
import { geminiModel } from "@/external/ai/provider";
import {
  createModuleTool,
  updateModuleTool,
  deleteModuleTool,
} from "../tools/learning-module.tool";
import {
  createTaskTool,
  updateTaskTool,
  deleteTaskTool,
} from "../tools/learning-task.tool";

export async function streamMessageHandler(c) {
  const { conversationId, learningPlanId, message } = c.req.valid("json");
  const userId = c.get("session").userId;

  // 1. 대화 세션 확인 또는 생성
  let conversation;
  if (conversationId) {
    conversation = await conversationQueryService.getConversation(
      conversationId,
      userId,
    );
  } else {
    conversation = await conversationCommandService.createConversation(
      learningPlanId,
      userId,
    );
  }

  // 2. 학습 계획 컨텍스트 로드
  const learningPlan =
    await learningPlanQueryService.getLearningPlanWithDetails(
      conversation.learningPlanId,
      userId,
    );

  // 3. 기존 메시지 히스토리 로드
  const messages = await messageQueryService.getMessages(conversation.id);

  // 3. 시스템 프롬프트 구성
  const systemPrompt = `
당신은 학습 계획을 관리하는 AI 튜터입니다.

현재 학습 계획:
- 주제: ${learningPlan.learningTopic}
- 목표 기간: ${learningPlan.targetWeeks}주
- 주간 학습 시간: ${learningPlan.weeklyHours}시간
- 현재 진도: ${learningPlan.completedTaskCount}/${learningPlan.totalTaskCount} 태스크 완료

학습 모듈:
${learningPlan.modules.map((m) => `- ${m.title}: ${m.description}`).join("\n")}

사용자의 질문에 답변하고, 필요시 제공된 도구를 사용해 학습 계획을 수정하세요.
`;

  // 4. 스트리밍 응답 생성
  const result = await streamText({
    model: geminiModel,
    system: systemPrompt,
    messages: [...messages, { role: "user", content: message }],
    tools: {
      createModule: createModuleTool,
      updateModule: updateModuleTool,
      deleteModule: deleteModuleTool,
      createTask: createTaskTool,
      updateTask: updateTaskTool,
      deleteTask: deleteTaskTool,
      // ... 기타 도구
    },
    maxSteps: 5, // Tool calling 최대 반복 횟수
  });

  // 5. 응답 완료 후 메시지 저장
  result.then(async (finalResult) => {
    await messageCommandService.saveMessages(conversation.id, [
      { role: "user", content: message },
      {
        role: "assistant",
        content: finalResult.text,
        toolInvocations: finalResult.toolInvocations,
      },
    ]);

    // 대화 세션 updatedAt 갱신
    await conversationCommandService.updateConversationTimestamp(
      conversation.id,
    );
  });

  // 6. 스트림 반환
  return result.toTextStreamResponse();
}
```

#### 2.2.4 UI 컴포넌트 레이어 (`packages/ui/src/ai`)

**디렉토리 구조**:

```
packages/ui/src/ai/
├── index.ts
├── conversation-list.tsx       # 대화 세션 목록
├── conversation-item.tsx       # 대화 세션 아이템
├── chat-container.tsx          # 채팅 컨테이너 (메시지 목록 + 입력창)
├── message-list.tsx            # 메시지 목록
├── message-item.tsx            # 개별 메시지
├── message-input.tsx           # 메시지 입력창
├── tool-invocation.tsx         # Tool 호출 표시
└── hooks/
    ├── use-conversations.ts    # 대화 세션 관리 훅
    ├── use-messages.ts         # 메시지 조회 훅
    └── use-stream-message.ts   # 스트리밍 전송 훅
```

**주요 컴포넌트**:

**`chat-container.tsx`**:

```typescript
import React from "react";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { useMessages } from "./hooks/use-messages";
import { useStreamMessage } from "./hooks/use-stream-message";

export interface ChatContainerProps {
  conversationId: string;
  learningPlanId: string;
  onToolInvocation?: (tool: string, result: any) => void;
}

export function ChatContainer({ conversationId, learningPlanId, onToolInvocation }: ChatContainerProps) {
  const { messages, isLoading } = useMessages(conversationId);
  const { sendMessage, isStreaming, error } = useStreamMessage();

  const handleSend = (content: string) => {
    sendMessage({ conversationId, learningPlanId, message: content });
  };

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput
        onSend={handleSend}
        disabled={isStreaming}
        placeholder="AI 튜터에게 질문하세요..."
      />
    </div>
  );
}
```

**`hooks/use-stream-message.ts`**:

```typescript
import { useState, useCallback } from "react";

export function useStreamMessage() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async ({
      conversationId,
      learningPlanId,
      message,
    }: {
      conversationId?: string;
      learningPlanId: string;
      message: string;
    }) => {
      setIsStreaming(true);
      setError(null);

      try {
        const response = await fetch(`/api/chat/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, learningPlanId, message }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          const chunk = decoder.decode(value);
          // SSE 스트림 처리 로직
          // Vercel AI SDK의 스트림 응답을 파싱하여 UI 업데이트
        }
      } catch (err) {
        setError(err as Error);
        console.error("Stream message error:", err);
      } finally {
        setIsStreaming(false);
      }
    },
    [],
  );

  return { sendMessage, isStreaming, error };
}
```

#### 2.2.5 프론트엔드 통합 (`apps/web`)

**파일 위치**: `apps/web/src/routes/app/learning-plans/$learningPlanId/index.tsx`

```typescript
import { useState } from "react";
import { ConversationList, ChatContainer } from "@repo/ui/ai";
import { useConversations } from "@/features/ai-chat/hooks/use-conversations";

export function LearningPlanDetailPage() {
  const { learningPlanId } = useParams();
  const { conversations } = useConversations(learningPlanId);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    conversations[0]?.id ?? null
  );

  return (
    <div className="grid grid-cols-[300px_1fr_400px] gap-4">
      {/* 기존 학습 계획 UI */}
      <div>
        <LearningPlanOverview />
      </div>

      <div>
        <LearningModuleList />
      </div>

      {/* 새로운 AI 채팅 UI */}
      <div className="border-l pl-4 flex flex-col h-full">
        <h2>AI 튜터와 채팅</h2>

        {/* 대화 세션 목록 */}
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
          learningPlanId={learningPlanId}
        />

        {/* 채팅 컨테이너 */}
        {selectedConversationId ? (
          <ChatContainer
            conversationId={selectedConversationId}
            learningPlanId={learningPlanId}
            onToolInvocation={(tool, result) => {
              // Tool 호출 후 학습 계획 데이터 refetch
              queryClient.invalidateQueries(["learningPlan", learningPlanId]);
            }}
          />
        ) : (
          <div>새 대화를 시작하세요</div>
        )}
      </div>
    </div>
  );
}
```

---

## 3. Tool 상세 설계

### 3.1 학습 모듈 관리 도구

| Tool 이름      | 파라미터                                               | 기능         |
| -------------- | ------------------------------------------------------ | ------------ |
| `createModule` | `learningPlanId`, `title`, `description`, `orderIndex` | 새 모듈 생성 |
| `updateModule` | `moduleId`, `title?`, `description?`, `orderIndex?`    | 모듈 수정    |
| `deleteModule` | `moduleId`                                             | 모듈 삭제    |

### 3.2 학습 태스크 관리 도구

| Tool 이름         | 파라미터                                                         | 기능                       |
| ----------------- | ---------------------------------------------------------------- | -------------------------- |
| `createTask`      | `moduleId`, `title`, `description`, `estimatedHours`             | 새 태스크 생성             |
| `updateTask`      | `taskId`, `title?`, `description?`, `status?`, `estimatedHours?` | 태스크 수정                |
| `deleteTask`      | `taskId`                                                         | 태스크 삭제                |
| `bulkUpdateTasks` | `taskIds[]`, `status`                                            | 여러 태스크 일괄 상태 변경 |

### 3.3 학습 계획 수정 도구

| Tool 이름    | 파라미터                                                           | 기능                      |
| ------------ | ------------------------------------------------------------------ | ------------------------- |
| `updatePlan` | `learningPlanId`, `targetWeeks?`, `weeklyHours?`, `learningStyle?` | 학습 계획 메타데이터 수정 |

### 3.4 정보 조회 도구

| Tool 이름     | 파라미터         | 기능                         |
| ------------- | ---------------- | ---------------------------- |
| `getProgress` | `learningPlanId` | 학습 진도 통계 조회          |
| `getModules`  | `learningPlanId` | 모듈 목록 조회               |
| `getTasks`    | `moduleId`       | 특정 모듈의 태스크 목록 조회 |

---

## 4. 구현 순서

### Phase 1: 기본 인프라 구축 (3-4일)

1. **데이터베이스 스키마 추가** (`packages/database`)
   - `aiConversation` 테이블 정의
   - `aiMessage` 테이블 정의
   - 인덱스 추가
   - 마이그레이션 생성 및 적용
   - 타입 생성 확인

2. **API 스펙 정의** (`packages/api-spec`)
   - Zod 스키마 작성 (`schema.ts`)
     - `MessageSchema`, `ConversationSchema`
     - `SendMessageRequestSchema`
     - `ConversationListResponseSchema`, `MessageListResponseSchema`
   - OpenAPI 라우트 정의 (`routes.ts`)
     - 5개 엔드포인트 (stream, conversations CRUD, messages GET)
   - 라우트 등록 (`routes/index.ts`)

3. **백엔드 Repository 구현** (`apps/api`)
   - `conversation.repository.ts` 작성
   - `message.repository.ts` 작성
   - CRUD 메서드 구현

### Phase 2: 백엔드 핵심 로직 (5-7일)

4. **Tool 구현** (`apps/api/src/modules/ai-chat/tools/`)
   - 학습 모듈 관리 도구 (create, update, delete)
   - 학습 태스크 관리 도구 (CRUD, bulk update)
   - 학습 계획 수정 도구
   - 정보 조회 도구 (progress, modules, tasks)

5. **서비스 레이어 구현**
   - `conversation-command.service.ts` (대화 세션 생성/삭제)
   - `conversation-query.service.ts` (대화 세션 조회)
   - `message-command.service.ts` (메시지 저장)
   - `message-query.service.ts` (메시지 조회)

6. **라우트 핸들러 구현**
   - `stream-message.handler.ts` (스트리밍 응답)
   - `get-conversations.handler.ts` (대화 세션 목록)
   - `get-messages.handler.ts` (메시지 목록)
   - `create-conversation.handler.ts` (대화 세션 생성)
   - `delete-conversation.handler.ts` (대화 세션 삭제)

### Phase 3: UI 컴포넌트 개발 (4-5일)

7. **공용 컴포넌트 구현** (`packages/ui/src/ai`)
   - `conversation-list.tsx` (대화 세션 목록)
   - `conversation-item.tsx` (대화 세션 아이템)
   - `chat-container.tsx` (채팅 컨테이너)
   - `message-list.tsx` (메시지 목록)
   - `message-item.tsx` (개별 메시지)
   - `message-input.tsx` (메시지 입력창)
   - `tool-invocation.tsx` (Tool 호출 표시)

8. **커스텀 훅 구현**
   - `use-conversations.ts` (대화 세션 관리)
   - `use-messages.ts` (메시지 조회)
   - `use-stream-message.ts` (스트리밍 전송)

9. **Storybook 스토리 작성**
   - 각 컴포넌트별 스토리
   - 인터랙션 테스트

### Phase 4: 프론트엔드 통합 (2-3일)

10. **학습 계획 상세 페이지 통합** (`apps/web`)
    - `ConversationList` + `ChatContainer` 통합
    - TanStack Query 설정 (대화 세션, 메시지 조회)
    - Tool 호출 후 데이터 refetch 로직
    - 대화 세션 전환 로직

11. **OpenAPI 문서 및 타입 생성**
    - `pnpm --filter api dev` (OpenAPI 문서 생성)
    - `pnpm --filter web schema:generate` (프론트엔드 타입 생성)

### Phase 5: 테스트 및 최적화 (3-4일)

12. **통합 테스트**
    - E2E 테스트 (채팅 플로우)
    - Tool 호출 테스트

13. **성능 최적화**
    - 스트리밍 응답 최적화
    - 히스토리 조회 쿼리 최적화

14. **에러 핸들링 강화**
    - Tool 실행 실패 시 재시도 로직
    - 사용자 친화적 에러 메시지

---

## 5. 기술적 고려사항

### 5.1 스트리밍 응답 처리

- **SSE (Server-Sent Events)** 사용
- Vercel AI SDK의 `toTextStreamResponse()` 활용
- 프론트엔드에서 `EventSource` 또는 `fetch` + `ReadableStream` 사용

### 5.2 Tool Calling 보안

- **권한 검증**: 모든 Tool에서 사용자 소유권 확인
- **입력 검증**: Zod 스키마로 파라미터 검증
- **Rate Limiting**: 채팅 API에 요청 제한 적용

### 5.3 컨텍스트 관리

- **컨텍스트 크기**: 학습 계획 정보를 시스템 프롬프트에 포함 (토큰 제한 고려)
- **대화 세션 격리**: 각 대화 세션은 독립적인 메시지 히스토리 유지
- **메시지 히스토리 제한**: 대화 세션당 최근 20개 메시지만 컨텍스트로 전달
- **동적 컨텍스트**: 필요시 Tool을 통해 추가 정보 조회
- **대화 세션 제목 자동 생성**: 첫 메시지를 기반으로 AI가 제목 생성 (옵션)

### 5.4 에러 핸들링

- **Tool 실행 실패**: AI에게 에러 메시지 전달하여 사용자에게 설명하도록 유도
- **스트리밍 중단**: 프론트엔드에서 재시도 UI 제공
- **타임아웃**: 30초 이상 응답 없을 시 연결 종료
- **대화 세션 없음**: conversationId가 유효하지 않으면 404 에러 반환

### 5.5 성능 최적화

- **대화 세션 목록 페이지네이션**: 커서 기반 페이지네이션 (최근순 정렬)
- **메시지 무한 스크롤**: 스크롤 업 시 이전 메시지 로드
- **Tool 결과 캐싱**: 동일한 조회 Tool은 캐시된 결과 반환
- **낙관적 업데이트**: Tool 호출 전 UI 미리 업데이트
- **대화 세션 updatedAt 인덱스**: 최근 대화 세션 조회 성능 향상

---

## 6. 참고 자료

### 6.1 Vercel AI SDK 문서

- [streamText API](https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text)
- [Tool Calling](https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling)
- [Google AI Provider](https://sdk.vercel.ai/providers/ai-sdk-providers/google-generative-ai)

### 6.2 기존 코드베이스 참고

- **AI 생성 패턴**: `apps/api/src/external/ai/features/learning-task-note/generator.ts`
- **비동기 작업 패턴**: `apps/api/src/modules/ai/services/learning-task-note-service.ts`
- **Repository 패턴**: `apps/api/src/lib/repository/base.repository.ts`

### 6.3 UI 참고

- [Vercel AI UI Elements](https://sdk.vercel.ai/docs/ai-sdk-ui/overview)
- [React Aria Components](https://react-spectrum.adobe.com/react-aria/components.html)

---

## 7. 성공 지표

| 지표                 | 목표                             |
| -------------------- | -------------------------------- |
| **응답 속도**        | 첫 토큰 응답 < 1초               |
| **Tool 실행 성공률** | > 95%                            |
| **사용자 만족도**    | Tool 호출 후 데이터 정확도 > 98% |
| **에러율**           | < 2%                             |
| **동시 사용자**      | 100명 이상 지원                  |

---

## 8. 향후 개선 계획

1. **음성 입력**: Web Speech API를 통한 음성 채팅
2. **멀티모달**: 이미지 업로드 및 분석 (학습 자료 스크린샷 등)
3. **학습 추천 알고리즘**: 사용자 학습 패턴 분석 후 맞춤형 추천
4. **협업 기능**: 여러 사용자가 하나의 학습 계획을 공유하며 채팅
5. **Tool 확장**: 외부 API 연동 (YouTube 자료 검색, GitHub 레포 분석 등)

---

## 9. 체크리스트

### 구현 전 준비사항

- [ ] Vercel AI SDK 최신 버전 확인 (v5.0.47+)
- [ ] Google Gemini API 할당량 확인
- [ ] 데이터베이스 백업 계획 수립
- [ ] 개발/스테이징 환경 구성

### 코드 품질

- [ ] TypeScript strict mode 준수
- [ ] ESLint 규칙 통과
- [ ] Prettier 포맷팅 적용
- [ ] 모든 함수에 JSDoc 주석 작성

### 보안

- [ ] 모든 Tool에 권한 검증 로직 추가
- [ ] 입력 검증 (Zod 스키마)
- [ ] CSRF 토큰 검증 (쿠키 기반 인증)
- [ ] Rate limiting 적용

### 테스트

- [ ] Repository 단위 테스트
- [ ] Service 단위 테스트
- [ ] E2E 테스트 (채팅 플로우)
- [ ] Tool 실행 테스트

### 문서화

- [ ] API 문서 (OpenAPI) 업데이트
- [ ] Storybook 스토리 작성
- [ ] README 업데이트
- [ ] Ubiquitous Language 문서 업데이트

---

## 10. 위험 요소 및 대응 방안

| 위험 요소                  | 영향 | 대응 방안                   |
| -------------------------- | ---- | --------------------------- |
| **Gemini API 할당량 초과** | 높음 | Rate limiting + 요청 큐잉   |
| **스트리밍 응답 중단**     | 중간 | 재시도 로직 + 에러 메시지   |
| **Tool 실행 실패**         | 높음 | 트랜잭션 롤백 + 사용자 알림 |
| **대규모 컨텍스트**        | 중간 | 토큰 제한 + 히스토리 요약   |
| **동시 접속 증가**         | 중간 | 서버리스 스케일링 + CDN     |

---

**문서 종료**
