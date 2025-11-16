# AI SDK v5 타입 세이프티 개선 계획

## 목차

- [개요](#개요)
- [현재 상황 분석](#현재-상황-분석)
- [AI SDK v5 타입 추론 기능](#ai-sdk-v5-타입-추론-기능)
- [개선 계획](#개선-계획)
- [구현 단계](#구현-단계)
- [기대 효과](#기대-효과)

---

## 개요

### 목표

AI SDK v5의 타입 추론 유틸리티를 최대한 활용하여 백엔드와 프론트엔드 간
**100% 타입 세이프**한 AI 채팅 시스템 구축

### 핵심 원칙

1. **Single Source of Truth**: `@repo/ai-types` 패키지에서 모든 타입 정의 관리
2. **타입 추론 최대화**: AI SDK의 `InferUITools`, `TypedToolCall`,
   `TypedToolResult` 등 활용
3. **컴파일 타임 안전성**: 런타임 에러를 컴파일 타임에 사전 방지
4. **개발자 경험 향상**: IDE 자동완성과 타입 체크로 생산성 향상

---

## 현재 상황 분석

### 패키지 구조

```
packages/ai-types/
├── src/
│   ├── index.ts           # 통합 export
│   ├── message.ts         # 메시지 타입
│   ├── tools.ts           # Tool 스키마 및 타입
│   ├── metadata.ts        # 메시지 메타데이터
│   └── data-parts.ts      # 스트리밍 데이터 파트
└── package.json
```

### 현재 타입 정의

#### 1. AppUIMessage (packages/ai-types/src/message.ts)

```typescript
export type AppUIMessage = UIMessage<MessageMetadata, UIDataTypes, never>;
                                                                  // ^^^^^ 문제!
```

**문제점**: Tools 타입이 `never`로 고정되어 있어 tool call/result 타입 추론 불가

#### 2. AllTools 타입 (packages/ai-types/src/tools.ts)

```typescript
export type AllTools = {
  createModule: {
    description: string;
    inputSchema: typeof createModuleInputSchema;
    outputSchema: typeof createModuleOutputSchema;
  };
  // ... 다른 tools
};
```

**문제점**:
- AI SDK의 `tool()` 함수로 생성된 실제 tool 인스턴스가 아님
- 스키마만 정의되어 있어 AI SDK 타입 추론과 연동 불가

#### 3. 백엔드 createTools (apps/api/src/modules/ai-chat/routes/stream-message.ts)

```typescript
function createTools(userId: string, learningPlanId: string) {
  return {
    createModule: createCreateModuleTool(userId, learningPlanId),
    updateModule: createUpdateModuleTool(userId, learningPlanId),
    // ...
  } as const;
}
```

**문제점**:
- `as const`로 타입이 좁혀져 있지만 외부로 export되지 않음
- 프론트엔드에서 이 타입을 사용할 수 없음

#### 4. 프론트엔드 useAIChat (apps/web/src/features/ai-chat/hooks/use-ai-chat.ts)

```typescript
const chat = useChat<AppUIMessage>({
  // ...
});
```

**문제점**:
- `AppUIMessage`의 Tools가 `never`이므로 tool 타입 추론 불가
- tool invocation, tool result의 타입이 `any`로 추론됨

---

## AI SDK v5 타입 추론 기능

### 1. InferUITools

**용도**: Tool set에서 input/output 타입을 자동 추출

```typescript
import { InferUITools } from 'ai';

type MyUITools = InferUITools<typeof myToolSet>;
// 결과:
// {
//   [toolName]: {
//     input: InferToolInput<Tool>;
//     output: InferToolOutput<Tool>;
//   }
// }
```

### 2. InferUITool

**용도**: 개별 tool의 input/output 타입 추출

```typescript
import { InferUITool } from 'ai';

type WeatherTool = InferUITool<typeof weatherTool>;
// 결과:
// {
//   input: { location: string };
//   output: string;
// }
```

### 3. TypedToolCall

**용도**: Tool call의 타입 추출

```typescript
import { TypedToolCall } from 'ai';

type MyToolCall = TypedToolCall<typeof myToolSet>;
// 결과: tool call의 유니온 타입
```

### 4. TypedToolResult

**용도**: Tool result의 타입 추출

```typescript
import { TypedToolResult } from 'ai';

type MyToolResult = TypedToolResult<typeof myToolSet>;
// 결과: tool result의 유니온 타입
```

### 5. tool() 함수

**용도**: 타입 안전한 tool 정의 (현재 사용 중)

```typescript
import { tool } from 'ai';

const myTool = tool({
  description: '...',
  inputSchema: z.object({ ... }),
  outputSchema: z.object({ ... }),
  execute: async (input) => { ... }
});
```

---

## 개선 계획

### 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                    @repo/ai-types                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Tool 스키마 정의 (Zod)                           │   │
│  │    - Input schemas (createModuleInputSchema, ...)   │   │
│  │    - Output schemas (createModuleOutputSchema, ...) │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 2. Tool 팩토리 함수 타입                            │   │
│  │    - ToolFactoryMap (백엔드에서 구현할 인터페이스)  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 3. 타입 추론 유틸리티                               │   │
│  │    - InferredToolSet (AI SDK의 InferUITools 활용)  │   │
│  │    - TypedMessage (Tools 제네릭 적용된 메시지)     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
┌───────────────────┐            ┌─────────────────────┐
│  apps/api         │            │  apps/web           │
│  ┌─────────────┐  │            │  ┌───────────────┐  │
│  │ Tool 구현   │  │            │  │ useChat 훅    │  │
│  │ (execute)   │  │            │  │ (타입 추론됨) │  │
│  └─────────────┘  │            │  └───────────────┘  │
│  ┌─────────────┐  │            │  ┌───────────────┐  │
│  │ streamText  │  │            │  │ 메시지 렌더링 │  │
│  │ (tools)     │  │            │  │ (타입 안전)   │  │
│  └─────────────┘  │            │  └───────────────┘  │
└───────────────────┘            └─────────────────────┘
```

### 주요 변경 사항

#### 1. @repo/ai-types 패키지 강화

**신규 파일**: `packages/ai-types/src/tool-definitions.ts`

```typescript
import { tool } from 'ai';
import type { z } from 'zod';
import {
  createModuleInputSchema,
  createModuleOutputSchema,
  // ... 다른 스키마들
} from './tools';

/**
 * Tool 정의 (스키마만 포함, execute 제외)
 * 백엔드에서 execute 함수를 주입하여 완전한 tool 생성
 */
export const toolDefinitions = {
  createModule: {
    description: '학습 모듈을 생성합니다. 학습 계획에 새로운 주제나 단원을 추가할 때 사용합니다.',
    inputSchema: createModuleInputSchema,
    outputSchema: createModuleOutputSchema,
  },
  updateModule: {
    description: '학습 모듈의 제목이나 설명을 수정합니다.',
    inputSchema: updateModuleInputSchema,
    outputSchema: updateModuleOutputSchema,
  },
  // ... 모든 tools
} as const;

/**
 * Tool 팩토리 함수 타입
 * 백엔드에서 구현해야 하는 execute 함수의 타입 정의
 */
export type ToolExecuteFunctions = {
  [K in keyof typeof toolDefinitions]: {
    execute: (
      input: z.infer<typeof toolDefinitions[K]['inputSchema']>
    ) => Promise<z.infer<typeof toolDefinitions[K]['outputSchema']>>;
  };
};

/**
 * 완전한 Tool Set 타입
 * AI SDK의 tool() 함수로 생성된 tools의 타입
 */
export type AppToolSet = {
  [K in keyof typeof toolDefinitions]: ReturnType<typeof tool<
    z.infer<typeof toolDefinitions[K]['inputSchema']>,
    z.infer<typeof toolDefinitions[K]['outputSchema']>
  >>;
};
```

**업데이트**: `packages/ai-types/src/message.ts`

```typescript
import type { UIMessage } from 'ai';
import type { InferUITools } from 'ai';
import type { AppToolSet } from './tool-definitions';
import type { MessageMetadata } from './metadata';
import type { UIDataTypes } from './data-parts';

/**
 * 타입 추론된 Tools
 */
export type InferredAppTools = InferUITools<AppToolSet>;

/**
 * 프로젝트의 표준 UIMessage 타입 (타입 세이프)
 * - Metadata: MessageMetadata
 * - Data: UIDataTypes
 * - Tools: InferredAppTools (AI SDK 타입 추론 적용)
 */
export type AppUIMessage = UIMessage<
  MessageMetadata,
  UIDataTypes,
  InferredAppTools
>;

/**
 * 타입 안전한 Tool Invocation
 */
export type AppToolInvocation = AppUIMessage['toolInvocations'][number];

/**
 * 타입 안전한 Tool Call
 */
export type AppToolCall = Extract<AppToolInvocation, { state: 'call' }>;

/**
 * 타입 안전한 Tool Result
 */
export type AppToolResult = Extract<AppToolInvocation, { state: 'result' }>;
```

#### 2. 백엔드 변경사항

**파일**: `apps/api/src/modules/ai-chat/tools/create-tools.ts` (신규)

```typescript
import { tool } from 'ai';
import { toolDefinitions, type AppToolSet } from '@repo/ai-types/tool-definitions';
import { learningModuleCommandService } from '../../learning-plan/services/learning-module.command.service';
import { learningModuleQueryService } from '../../learning-plan/services/learning-module.query.service';
// ... 다른 services

/**
 * Tool Set 생성 함수
 * toolDefinitions에서 스키마를 가져와 execute 함수를 주입
 */
export function createTools(
  userId: string,
  learningPlanId: string
): AppToolSet {
  return {
    createModule: tool({
      description: toolDefinitions.createModule.description,
      inputSchema: toolDefinitions.createModule.inputSchema,
      outputSchema: toolDefinitions.createModule.outputSchema,
      execute: async ({ title, description }) => {
        try {
          const result = await learningModuleCommandService.createModule({
            userId,
            learningPlanId,
            title,
            description: description || null,
          });
          return { success: true, data: result };
        } catch (error) {
          return { success: false, error: '모듈 생성에 실패했습니다.' };
        }
      },
    }),

    updateModule: tool({
      description: toolDefinitions.updateModule.description,
      inputSchema: toolDefinitions.updateModule.inputSchema,
      outputSchema: toolDefinitions.updateModule.outputSchema,
      execute: async ({ moduleId, title, description }) => {
        try {
          const result = await learningModuleCommandService.updateModule({
            userId,
            learningModuleId: moduleId,
            title,
            description,
          });
          return { success: true, data: result };
        } catch (error) {
          return { success: false, error: '모듈 수정에 실패했습니다.' };
        }
      },
    }),

    // ... 모든 tools 정의
  } as AppToolSet;
}
```

**업데이트**: `apps/api/src/modules/ai-chat/routes/stream-message.ts`

```typescript
import type { AppUIMessage } from '@repo/ai-types';
import { createTools } from '../tools/create-tools';

// createTools 함수 제거 (별도 파일로 분리됨)

const streamMessage = new OpenAPIHono<{
  Variables: { auth: AuthContext };
}>().openapi(
  {
    ...streamMessageRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    // ... 기존 로직

    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const result = streamText({
          model: geminiModel,
          system: systemPrompt,
          messages: convertToModelMessages(uiMessages),
          stopWhen: stepCountIs(5),
          tools: createTools(userId, planContext.learningPlan.id),
          // ↑ 이제 AppToolSet 타입으로 추론됨
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          }),
        );
      },
      // ...
    });

    return createUIMessageStreamResponse({ stream });
  },
);
```

#### 3. 프론트엔드 변경사항

**업데이트**: `apps/web/src/features/ai-chat/hooks/use-ai-chat.ts`

```typescript
import { useChat } from '@ai-sdk/react';
import type { AppUIMessage } from '@repo/ai-types';
// AppUIMessage가 이제 InferredAppTools를 포함함

export function useAIChat({ conversationId, learningPlanId }: UseAIChatProps) {
  const queryClient = useQueryClient();

  const chat = useChat<AppUIMessage>({
    // ↑ 이제 tools의 타입이 완전히 추론됨
    transport: new DefaultChatTransport({
      api: "http://localhost:3001/chat/stream",
      credentials: "include",
      body: {
        conversationId: conversationId ?? undefined,
        learningPlanId,
      },
    }),
    onFinish: () => {
      // 스트리밍 완료 후 쿼리 무효화
      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: ["messages", conversationId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["conversations", learningPlanId],
      });
      queryClient.invalidateQueries({
        queryKey: ["learningPlan", learningPlanId],
      });
    },
    onError: (error: Error) => {
      console.error("AI 채팅 에러:", error);
    },
  });

  return chat;
}
```

**신규**: `apps/web/src/features/ai-chat/components/tool-invocation-renderer.tsx`

```typescript
import type { AppToolInvocation } from '@repo/ai-types';

interface ToolInvocationRendererProps {
  invocation: AppToolInvocation;
}

/**
 * Tool Invocation 렌더링 컴포넌트
 * 타입 안전하게 tool invocation을 렌더링
 */
export function ToolInvocationRenderer({
  invocation
}: ToolInvocationRendererProps) {
  // invocation.toolName이 타입 좁히기됨
  switch (invocation.toolName) {
    case 'createModule':
      // invocation.args의 타입이 CreateModuleInput으로 추론됨
      // invocation.result의 타입이 CreateModuleOutput으로 추론됨
      return (
        <div className="tool-invocation">
          <h4>모듈 생성</h4>
          <p>제목: {invocation.args.title}</p>
          {invocation.state === 'result' && invocation.result.success && (
            <p>생성된 모듈 ID: {invocation.result.data.id}</p>
          )}
        </div>
      );

    case 'updateModule':
      return (
        <div className="tool-invocation">
          <h4>모듈 수정</h4>
          <p>모듈 ID: {invocation.args.moduleId}</p>
          {invocation.args.title && <p>새 제목: {invocation.args.title}</p>}
        </div>
      );

    // ... 다른 tools

    default:
      // exhaustive check - 모든 tool을 처리했는지 컴파일 타임에 확인
      const _exhaustiveCheck: never = invocation;
      return null;
  }
}
```

---

## 구현 단계

### Phase 1: 타입 정의 리팩토링 (1-2일)

1. `packages/ai-types/src/tool-definitions.ts` 생성
   - toolDefinitions 정의
   - ToolExecuteFunctions 타입 정의
   - AppToolSet 타입 정의

2. `packages/ai-types/src/message.ts` 업데이트
   - InferredAppTools 타입 추가
   - AppUIMessage의 Tools 제네릭 업데이트
   - AppToolInvocation, AppToolCall, AppToolResult 타입 추가

3. `packages/ai-types/src/index.ts` 업데이트
   - 신규 타입들 export

**검증**:
- `pnpm --filter @repo/ai-types check-types` 성공
- 패키지 빌드 성공

### Phase 2: 백엔드 적용 (2-3일)

1. `apps/api/src/modules/ai-chat/tools/create-tools.ts` 생성
   - 기존 tool factory 함수들을 통합
   - toolDefinitions에서 스키마 가져오기
   - execute 함수 구현

2. 기존 tool 파일들 제거 또는 리팩토링
   - `learning-module.tool.ts`
   - `learning-task.tool.ts`
   - `query-info.tool.ts`

3. `stream-message.ts` 업데이트
   - createTools import 변경
   - 타입 체크 확인

**검증**:
- `pnpm --filter api check-types` 성공
- API 서버 실행 및 동작 테스트
- Tool 호출 시 타입 추론 확인 (IDE에서)

### Phase 3: 프론트엔드 적용 (2-3일)

1. `use-ai-chat.ts` 업데이트
   - AppUIMessage 타입 적용 확인
   - tool invocation 타입 확인

2. `tool-invocation-renderer.tsx` 구현
   - 각 tool별 렌더링 로직
   - 타입 안전한 switch-case 구현
   - Exhaustive check 적용

3. 기존 메시지 렌더링 로직 업데이트
   - tool invocation 렌더링 통합

**검증**:
- `pnpm --filter web check-types` 성공
- 프론트엔드 빌드 성공
- 실제 채팅 UI에서 tool 호출 및 결과 렌더링 확인

### Phase 4: 테스트 및 문서화 (1-2일)

1. 타입 안전성 테스트
   - 의도적으로 잘못된 타입 사용 시 컴파일 에러 확인
   - IDE 자동완성 확인

2. 통합 테스트
   - 백엔드 → 프론트엔드 전체 플로우 테스트
   - 다양한 tool 호출 시나리오 테스트

3. 문서 업데이트
   - `CLAUDE.md`에 새로운 타입 시스템 설명 추가
   - 개발 가이드 작성

**검증**:
- 모든 타입 체크 통과
- 실제 사용 시나리오 정상 동작
- 문서 완성도 확인

---

## 기대 효과

### 1. 타입 안전성

#### Before (현재)

```typescript
// 백엔드
const tools = createTools(userId, planId); // 타입: any

// 프론트엔드
const { messages } = useChat<AppUIMessage>();
// messages[0].toolInvocations?.[0].args // 타입: any
// messages[0].toolInvocations?.[0].result // 타입: any
```

#### After (개선 후)

```typescript
// 백엔드
const tools = createTools(userId, planId); // 타입: AppToolSet
// tools.createModule.execute의 인자 타입 자동 추론
// tools.createModule.execute의 반환 타입 자동 추론

// 프론트엔드
const { messages } = useChat<AppUIMessage>();
// messages[0].toolInvocations?.[0].toolName // 타입: 'createModule' | 'updateModule' | ...
// messages[0].toolInvocations?.[0].args // 타입: tool별로 정확히 추론됨
// messages[0].toolInvocations?.[0].result // 타입: tool별로 정확히 추론됨

// 타입 좁히기 지원
if (invocation.toolName === 'createModule') {
  // invocation.args는 CreateModuleInput 타입으로 자동 좁혀짐
  console.log(invocation.args.title); // ✅ 타입 안전
}
```

### 2. 개발자 경험 향상

- **IDE 자동완성**: tool name, args, result 모두 자동완성 지원
- **컴파일 타임 에러**: 잘못된 tool 사용 시 즉시 에러 감지
- **리팩토링 안전성**: tool 스키마 변경 시 사용처에서 자동으로 에러 발생

### 3. 유지보수성 향상

- **Single Source of Truth**: 모든 tool 정의가 `@repo/ai-types`에 집중
- **일관성**: 백엔드와 프론트엔드가 동일한 타입 사용
- **변경 추적**: 타입 변경 시 영향받는 모든 코드 파악 가능

### 4. 버그 감소

- **런타임 에러 → 컴파일 에러**: 타입 불일치를 런타임 전에 감지
- **Null/Undefined 체크**: 옵셔널 필드에 대한 명확한 타입 정의
- **Exhaustive Check**: switch-case에서 모든 경우 처리 보장

---

## 예상 문제 및 해결 방안

### 문제 1: 순환 의존성

**문제**: `@repo/ai-types`가 `ai` 패키지에 의존하는데, 이 패키지를 백엔드와
프론트엔드에서 모두 사용할 때 번들 크기 증가 우려

**해결**:
- `@repo/ai-types`는 타입만 export (런타임 코드 최소화)
- `tool()` 함수 호출은 백엔드에서만 수행
- 프론트엔드는 타입만 import

### 문제 2: Tool 추가 시 작업량

**문제**: 새로운 tool 추가 시 여러 파일 수정 필요

**해결**:
- Tool 스키마는 `@repo/ai-types/src/tools.ts`에만 정의
- Execute 함수는 `apps/api/src/modules/ai-chat/tools/create-tools.ts`에만 추가
- 나머지는 타입 추론으로 자동 처리

### 문제 3: 타입 추론 복잡도

**문제**: 복잡한 제네릭 타입으로 인한 타입 추론 실패 가능성

**해결**:
- 명시적 타입 어노테이션 추가
- 타입 헬퍼 함수 사용 (`InferUITools` 등)
- 필요시 `satisfies` 키워드 활용

---

## 참고 자료

- [AI SDK v5 공식 문서](https://ai-sdk.dev/)
- [AI SDK Core: Tool Calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)
- [AI SDK UI: InferUITools](https://ai-sdk.dev/docs/reference/ai-sdk-ui/infer-ui-tools)
- [AI SDK UI: InferUITool](https://ai-sdk.dev/docs/reference/ai-sdk-ui/infer-ui-tool)
- [TypeScript: Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [TypeScript: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

---

## 작성 정보

- **작성일**: 2025-11-16
- **작성자**: AI Assistant
- **버전**: 1.0.0
- **상태**: 계획 단계
