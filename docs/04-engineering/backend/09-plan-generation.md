# Plan Generation

## 개요

AI 기반 학습 계획(커리큘럼) 생성 파이프라인. **2단계 생성**으로 효율성과 응집성을 확보합니다.

## 설계 결정

### 1. Two-Stage Generation (2단계 생성)

**결정**: 구조 설계(1단계) → 모듈별 세션 생성(2단계)

```
┌─────────────────────────────────────────────────────────┐
│ 1단계: 구조 설계 (Structure Planning)                   │
│    - 자료 메타정보 기반 전체 학습 구조 설계             │
│    - 모듈 단위로 chunkRange, sessionCount 배정          │
│    - 1회 AI 호출                                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 2단계: 모듈별 세션 생성 (Module Population)              │
│    - 모듈 단위로 청크 내용 로드                         │
│    - 모듈별 일괄 세션 생성 (모듈당 1회 AI 호출)         │
│    - N개 모듈 = N회 AI 호출                             │
└─────────────────────────────────────────────────────────┘
```

**근거**:

- **Token efficiency**: 전체 문서를 한번에 보내지 않고 필요한 청크만 로드
- **Parallelization**: 모듈별 생성은 독립적, 병렬 처리 가능
- **Quality**: 모듈 단위 집중으로 더 정교한 세션 설계
- **API 호출 감소**: 기존 세션당 1회 → 모듈당 1회 (최대 89% 감소)

### 2. Structure-First Approach

**결정**: 세션 상세화 전 전체 구조를 먼저 설계

**근거**:

- **Context window**: Gemini 2.5 Flash Lite의 context limit 고려
- **Coherence**: 전체 흐름 파악 후 세션 배분
- **User requirements**: 특별 요구사항(짧은 기간 등)을 구조 단계에서 반영

### 3. ChunkRange-Based Allocation

**결정**: 모듈별로 관련 청크 범위(chunkRange) 지정

| 개념         | 설명                                                    |
| ------------ | ------------------------------------------------------- |
| chunkRange   | 모듈이 담당하는 자료의 청크 범위 (start~end, inclusive) |
| sessionCount | 모듈에 배정할 세션 수 (1~10)                            |

**근거**:

- **Precise retrieval**: 세션 생성 시 정확한 청크만 로드
- **Flexibility**: 모듈 단위로 분량 조절 가능
- **Citation**: chunkRange로 출처 추적 가능

## 세션 수 결정 정책

### 우선순위 (높음 → 낮음)

1. **사용자의 특별 요구사항** (예: "하루 완성", "핵심 요약")
2. **사용자 지정 희망 세션 수**
3. **자료 분량 기반 권장 가이드** (청크 2~3개당 1세션)

**근거**:

- **User-centric**: 사용자 의도를 최우선으로
- **Flexibility**: "100개 청크라도 하루 완성" 요청 가능
- **Sensible default**: 특별 요구 없을 시 분량 기반

## AI 호출 최적화

### 효율 비교

| 시나리오 | 세션 수 | 모듈 수 | 기존 호출 | 현재 호출 | 감소율 |
| -------- | ------- | ------- | --------- | --------- | ------ |
| 소규모   | 10      | 2       | 11회      | 3회       | 73%    |
| 중규모   | 30      | 4       | 31회      | 5회       | 84%    |
| 대규모   | 60      | 6       | 61회      | 7회       | 89%    |

**계산**: `전체 호출 = 1 (구조 설계) + N (모듈 수)`

## 진행 상태 추적

### Progress Reporting

```
PENDING → GENERATING (10%) → FINALIZING (80%) → COMPLETED (100%)
              ↓
            FAILED (error message)
```

**단계별 메시지**:

- **GENERATING**: "AI가 학습 계획을 생성하고 있습니다..."
- **FINALIZING**: "계획을 저장하고 있습니다..."
- **COMPLETED**: "완료되었습니다."

**근거**:

- **UX**: 긴 AI 호출 동안 사용자 피드백
- **Debugging**: 실패 시 어떤 단계에서 문제 발생 파악

## 실패 처리 전략

| 실패 유형      | 동작               | 이유                  |
| -------------- | ------------------ | --------------------- |
| 자료 조회 실패 | 폴백 메타정보 사용 | Plan 생성 가능해야 함 |
| 청크 조회 실패 | 폴백 세션 생성     | 세션 생성 가능해야 함 |
| 1단계 AI 실패  | 에러 전파          | 구조 없이는 진행 불가 |
| 2단계 AI 실패  | 모듈별 폴백 세션   | 부분 성공 허용        |

## 보이지 않는 규칙

1. **Never trust AI output blindly**: Zod 스키마로 응답 검증 필수
2. **Always validate chunkRange**: 0 ≤ start ≤ end < chunkCount
3. **Always include source references**: 세션-자료 매핑 정보 필수
4. **Never exceed AI context limit**: 청크 로드 시 token 수 계산
5. **Always save blueprint**: 재사용/디버깅을 위해 blueprint 저장

## 관련 문서

- [Prompt & Templates](./prompt-and-templates.md) - AI 프롬프트 설계
- [RAG Retrieval](./rag-retrieval.md) - 청크 검색
- [packages/core/modules/plan](../../../packages/core/src/modules/plan/) - Plan 모듈
