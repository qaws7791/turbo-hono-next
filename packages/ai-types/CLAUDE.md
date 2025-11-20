# @repo/ai-types

AI SDK v5 타입 패키지 - 백엔드와 프론트엔드 간 AI 관련 타입 공유

## Purpose

- AI 도구 정의와 입출력 스키마
- AI 채팅 메시지 타입
- 스트리밍 데이터 타입
- **중요**: 구현 로직 없이 타입과 스키마만 제공

## Key Files

- `tool-definitions.ts`: AI 도구 스키마 정의 (execute 함수 제외)
- `tools.ts`: 도구별 입출력 스키마 (Zod)
- `message.ts`: 메시지 및 대화 타입
- `data-parts.ts`: 스트리밍 데이터 타입

## Important Rules

1. **타입만 정의** - 비즈니스 로직은 apps/api에서 구현
2. **execute 함수는 백엔드에서 주입** - 이 패키지는 스키마만
3. Zod 스키마로 정의 (타입 추론 + 런타임 검증)
4. 모든 스키마는 Input/Output 쌍으로 정의

## Adding a New Tool

1. `tools.ts`에 input/output 스키마 추가
2. `tool-definitions.ts`에 도구 정의 추가
3. `index.ts`에 export 추가
4. Backend에서 execute 구현

## Design Note

프론트엔드는 타입만 사용 → 번들 사이즈 최소화
