# Prompt & Templates

## 개요

AI 프롬프트 설계 원칙, 버전 관리, 품질 보장 전략.

## 설계 결정

### 1. Separation of Concerns (관심사 분리)

**결정**: 시스템 프롬프트와 사용자 프롬프트 분리

| 구성요소      | 역할                                 | 변경 빈도 |
| ------------- | ------------------------------------ | --------- |
| System Prompt | AI의 역할, 응답 형식, 제약조건 정의  | 낮음      |
| User Prompt   | 구체적인 작업, 입력 데이터, 컨텍스트 | 높음      |

**근거**:

- **Maintainability**: 시스템 지시와 작업 내용 분리
- **Reusability**: 동일 시스템 프롬프트로 다양한 작업
- **Clarity**: AI가 역할과 작업을 명확히 구분

### 2. Structured Output Enforcement

**결정**: Zod 스키마로 응답 형식 강제

**단계**:

```
1. System prompt에 응답 형식 설명
2. User prompt에 예시/제약 포함
3. AI 응답 수신
4. Zod schema로 검증
5. 실패 시 재시도 또는 폴백
```

**근거**:

- **Type safety**: 컴파일 타임 타입 안전성
- **Validation**: 런타임 데이터 검증
- **Error handling**: 잘못된 응답 명시적 처리

### 3. Context Window Management

**결정**: Gemini 2.5 Flash Lite의 context limit 고려

| 모델                  | Context   | Output    |
| --------------------- | --------- | --------- |
| Gemini 2.5 Flash Lite | 1M tokens | 8K tokens |

**전략**:

- **Chunk loading**: 필요한 청크만 선택적 로드
- **Summarization**: 긴 문서는 요약 후 전달
- **Two-stage**: 구조 설계와 상세화 분리

**근거**:

- **Cost**: 불필요한 token 사용 비용 절감
- **Quality**: 적정량의 컨텍스트가 더 나은 응답
- **Latency**: 적은 token = 빠른 응답

## Plan Generation 프롬프트

### 1단계: 구조 설계

**목표**: 전체 학습 구조와 모듈 단위 설계

**시스템 프롬프트 핵심**:

- 전문 학습 플래너 역할 정의
- 모듈 설계 원칙 (논리적 그룹핑, 1~10 세션/모듈)
- chunkRange 제약 (0부터 시작, inclusive)
- 의사결정 우선순위 (사용자 요구 > 희망 세션 수 > 분량 가이드)

**사용자 프롬프트 핵심**:

- 자료 메타정보 (제목, 청크 수, 문서 구조)
- 학습 목표와 기간
- 특별 요구사항

### 2단계: 모듈별 세션 생성

**목표**: 모듈 내 세션들의 상세 설계

**시스템 프롬프트 핵심**:

- 모듈 흐름 고려한 순차적 세션 구성
- SMART 원칙 기반 학습 목표
- 시간 배분 (25~50분/세션)
- 순차적 청크 할당

**사용자 프롬프트 핵심**:

- 모듈 정보 (제목, 설명, 세션 수)
- 해당 모듈의 청크 내용

### 의사결정 우선순위

```
1. 사용자의 특별 요구사항 (예: "하루 완성")
2. 사용자가 지정한 희망 세션 수
3. 자료 분량 기반 권장 가이드 (청크 2~3개당 1세션)
```

**근거**:

- **User-centric**: 사용자 의도 최우선 반영
- **Flexibility**: AI가 분량에 얽매이지 않고 조정

## RAG Chat 프롬프트

### System Prompt 핵심

- **Scope limitation**: "제공된 문서 내용만 기반으로 답변"
- **No hallucination**: "문서에 없으면 모른다고 답변"
- **Citation**: 출처 표시 요구
- **Korean**: 한국어 응답 강제

### Retrieval 컨텍스트 형식

```
[Context]
Document 1 (Page 5):
<청크 내용>

Document 2 (Page 12):
<청크 내용>

[Question]
사용자 질문
```

## 버전 관리

### 프롬프트 버전 태그

```
PROMPT_VERSIONS = {
  planGeneration: "v1.0.0",
  chat: "v1.2.0",
  sessionBlueprint: "v1.0.0"
}
```

### 변경 관리

| 버전  | 변경 내용      | 검증 방법          |
| ----- | -------------- | ------------------ |
| Major | 구조/역할 변경 | 골든 테스트 재실행 |
| Minor | 제약/지시 추가 | 샘플 셋 비교       |
| Patch | 표현/예시 수정 | 리뷰               |

## 품질 보장 (QA)

### Golden Tests

**정의**: 핵심 시나리오에 대한 기대 응답

**예시**:

- "문서에 없는 질문" → "찾을 수 없습니다"
- "지나치게 긴 세션" → 50분 이하 제약
- "잘못된 chunkRange" → 경계값 검증

### 변경 시 절차

```
1. 프롬프트 수정
2. 골든 테스트 실행
3. 품질 회귀 여부 확인
4. A/B 비교 (선택)
5. 버전 태그 업데이트
6. 배포
```

## 보이지 않는 규칙

1. **Never hardcode dynamic values**: 날짜, 수치 등은 파라미터로
2. **Always validate AI output**: Zod 검증 필수
3. **Never trust AI without constraints**: 제약조건 명시
4. **Always include examples**: Few-shot 예시로 품질 향상
5. **Keep prompts DRY**: 공통 지시는 재사용

## 참고 문서

- [Plan Generation](./plan-generation.md) - 프롬프트 활용
- [RAG Retrieval](./rag-retrieval.md) - 검색 컨텍스트
- [packages/core/modules/plan/ai](../../../packages/core/src/modules/plan/internal/application/ai/) - 프롬프트 구현
