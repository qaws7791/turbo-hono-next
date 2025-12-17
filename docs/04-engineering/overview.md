# Engineering Overview

## 개요

이 문서는 04-engineering 섹션의 전체 범위, 우선순위, MVP 스코프를 정의하고 엔지니어링 의사결정 체크리스트를 제공합니다.

---

## 문서 범위

04-engineering 섹션은 다음 영역을 포함합니다:

| 분류           | 문서            | 설명                                    |
| -------------- | --------------- | --------------------------------------- |
| **아키텍처**   | architecture.md | 시스템 구조, 컴포넌트 책임, 데이터 흐름 |
| **데이터**     | data-models.md  | 엔티티 정의, ERD, 스키마 설계           |
| **기술 스택**  | tech-stack.md   | 프론트/백/DB/AI 기술 선택               |
| **ADR**        | adr/\*.md       | 주요 설계 결정 기록                     |
| **API**        | api/\*.md       | API 계약, 엔드포인트 스펙               |
| **백엔드**     | backend/\*.md   | 서버 구현 상세                          |
| **프론트엔드** | frontend/\*.md  | 클라이언트 구현 상세                    |
| **정책**       | policies/\*.md  | 운영/보안/데이터 정책                   |

---

## MVP 스코프

### 포함

1. **핵심 기능**
   - 사용자 인증 (Google OAuth + 매직링크)
   - Space/Document/Plan/Session/Concept CRUD
   - RAG 기반 AI 대화
   - Spaced Repetition 기반 복습

2. **동기 처리 우선**
   - 문서 인덱싱: 동기 처리
   - Plan 생성: 동기 처리
   - 단, 비동기 전환 인터페이스 준비

3. **단일 사용자 모드**
   - 협업/공유 기능 제외
   - 개인 학습에 집중

### 제외 (향후 확장)

- 팀/조직 기능
- 고급 분석 대시보드
- 커스텀 프롬프트 설정
- 외부 서비스 연동 (Notion, Anki 등)

---

## 동기/비동기 전환 기준

MVP에서는 동기 처리를 기본으로 하되, 다음 조건 충족 시 비동기 전환을 고려합니다:

| 기능            | 동기 유지 조건     | 비동기 전환 조건             |
| --------------- | ------------------ | ---------------------------- |
| **문서 인덱싱** | < 20페이지, < 30초 | ≥ 20페이지 또는 ≥ 30초 예상  |
| **Plan 생성**   | < 5문서, < 20초    | ≥ 5문서 또는 복잡한 커리큘럼 |
| **GC**          | Plan 완료 시 즉시  | 대량 데이터 처리 필요 시     |

### 전환 시 API 변경

동기 → 비동기 전환 시:

```
// 동기
POST /materials → 201 Created { id, status: "READY" }

// 비동기
POST /materials → 202 Accepted { id, jobId, status: "PROCESSING" }
GET /jobs/{jobId} → { status, progress, result }
```

---

## 의사결정 체크리스트

### 아키텍처

- [x] 프론트/백 분리 구조 확정
- [x] DB 선택 (PostgreSQL + pgvector)
- [x] 파일 스토리지 선택 (Cloudflare R2)
- [x] AI 오케스트레이션 (LangChain)

### 데이터 모델

- [x] 핵심 엔티티 정의 (User, Space, Material, Plan, Session, Concept)
- [x] 좀비 데이터 전략 수립
- [x] Session/SessionRun 분리

### API

- [ ] 인증 엔드포인트 상세
- [ ] 에러 코드 체계 확정
- [ ] Pagination 규칙 확정

### 보안

- [x] 인증 방식 (OAuth + 매직링크)
- [ ] Rate Limit 정책
- [ ] 파일 업로드 보안 규칙

### 운영

- [ ] 로깅 전략
- [ ] 모니터링 메트릭 정의
- [ ] 장애 대응 절차

---

## 우선순위 가이드

### P0 (필수)

- 사용자 인증/인가
- Material 업로드 및 인덱싱
- Plan 생성 및 운영
- Session 실행 및 복구
- Concept 자동 저장

### P1 (중요)

- RAG 기반 AI 대화
- Spaced Repetition
- 세션 요약 생성

### P2 (개선)

- 비동기 처리 전환
- 고급 검색 (하이브리드)
- 상세 분석/통계

---

## 관련 문서

- [시스템 아키텍처](./architecture.md)
- [데이터 모델](./data-models.md)
- [기술 스택](./tech-stack.md)
- [의사결정 기록](./decision-log.md)
