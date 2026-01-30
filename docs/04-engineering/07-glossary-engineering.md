# 엔지니어링 용어집

## 개요

이 문서는 엔지니어링 문서에서 사용되는 기술 용어를 정의합니다. 제품/비즈니스 용어는 [01-overview/glossary.md](../01-overview/glossary.md)를 참조하세요.

---

## 데이터/파이프라인 용어

| 용어             | 정의                                                           | 예시                        |
| ---------------- | -------------------------------------------------------------- | --------------------------- |
| **Ingestion**    | 문서를 시스템에 투입하고 처리 가능한 형태로 변환하는 전체 과정 | parse → chunk → embed       |
| **Parse**        | 원본 문서(PDF, URL 등)에서 텍스트를 추출하는 단계              | PDF에서 텍스트 추출         |
| **Chunk**        | 긴 텍스트를 검색/임베딩에 적합한 작은 단위로 분할              | 500~1000 토큰 단위 분할     |
| **Embed**        | 텍스트를 벡터(수치 배열)로 변환하여 의미 기반 검색 가능하게 함 | Gemini gemini-embedding-001 |
| **Vector Store** | 임베딩 벡터를 저장하고 유사도 검색을 수행하는 저장소           | pgvector                    |
| **Top-K**        | 검색 시 가장 유사한 상위 K개 결과를 반환                       | Top-5 청크 검색             |
| **Citation**     | AI 답변의 근거가 되는 원본 문서/청크 참조                      | "출처: React 문서 p.12"     |

---

## 세션/실행 용어

| 용어            | 정의                                           | 예시                       |
| --------------- | ---------------------------------------------- | -------------------------- |
| **Session**     | 스케줄 상의 학습 단위 (plan_sessions 테이블)   | "Day 3: useState 학습"     |
| **Session Run** | Session의 실제 실행 기록 (session_runs 테이블) | 시작 시간, 종료 시간, 상태 |
| **Step**        | 세션 내의 개별 단계                            | 학습 → 체크 → 활동 → 완료  |
| **Check-in**    | 세션 중 이해도를 확인하는 저마찰 신호 수집     | 선택형 질문, 자기평가      |
| **Recovery**    | 중단된 세션을 이어서 진행할 수 있도록 복원     | 네트워크 끊김 후 재진입    |

---

## API/통신 용어

| 용어            | 정의                                                       | 예시                    |
| --------------- | ---------------------------------------------------------- | ----------------------- |
| **Idempotency** | 동일 요청을 여러 번 보내도 결과가 동일함을 보장            | idempotency-key 헤더    |
| **Polling**     | 클라이언트가 주기적으로 상태를 조회                        | 3초마다 /jobs/{id} 조회 |
| **SSE**         | Server-Sent Events, 서버 → 클라이언트 단방향 실시간 스트림 | 인덱싱 진행률 전송      |
| **Rate Limit**  | 일정 시간 내 요청 수 제한                                  | 분당 60회 요청 제한     |
| **Pagination**  | 대량 데이터를 페이지 단위로 나누어 제공                    | ?page=1&limit=20        |

---

## 상태/생명주기 용어

| 용어                  | 정의                      | 가능한 값                                     |
| --------------------- | ------------------------- | --------------------------------------------- |
| **processing_status** | Material의 분석 처리 상태 | PENDING → PROCESSING → READY / FAILED         |
| **plan_status**       | Plan의 운영 상태          | ACTIVE / PAUSED / ARCHIVED / COMPLETED        |
| **session_status**    | Session의 스케줄 상태     | SCHEDULED / IN_PROGRESS / COMPLETED / SKIPPED |
| **run_status**        | Session Run의 실행 상태   | RUNNING / COMPLETED / ABANDONED               |

---

## 좀비 데이터/GC 용어

| 용어                        | 정의                                                   | 비고                         |
| --------------------------- | ------------------------------------------------------ | ---------------------------- |
| **Soft Delete**             | DB에서 물리 삭제 없이 deleted_at 표시만 함             | UI에서는 숨김                |
| **Hard Delete**             | DB, R2, Vector에서 물리적으로 완전 삭제                | 복구 불가                    |
| **Zombie Data**             | Soft Delete되었지만 참조로 인해 유지되는 데이터        | Plan이 참조 중인 삭제된 문서 |
| **GC (Garbage Collection)** | 더 이상 참조되지 않는 좀비 데이터를 물리 삭제하는 과정 | Plan 완료/삭제 시 트리거     |
| **Reference Count**         | 해당 리소스를 참조하는 Active Plan 수                  | 0이면 GC 대상                |

---

## AI/ML 용어

| 용어                | 정의                                                  | 예시                             |
| ------------------- | ----------------------------------------------------- | -------------------------------- |
| **RAG**             | Retrieval-Augmented Generation, 검색 기반 답변 생성   | 문서 검색 → 컨텍스트로 LLM 호출  |
| **Retriever**       | RAG에서 관련 문서/청크를 검색하는 컴포넌트            | pgvector similarity_search       |
| **Generator**       | 검색된 컨텍스트를 기반으로 답변을 생성하는 LLM 호출부 | Gemini gemini-2.5-flash-lite     |
| **Prompt Template** | LLM 호출 시 사용되는 템플릿화된 프롬프트              | 시스템 프롬프트, 사용자 프롬프트 |
| **Hallucination**   | LLM이 사실이 아닌 내용을 생성하는 현상                | 문서에 없는 내용 생성            |
| **Grounding**       | 답변을 특정 문서/출처에 기반하도록 제한               | Citation 포함 응답               |

---

## 인프라 용어

| 용어           | 정의                                          | 예시                         |
| -------------- | --------------------------------------------- | ---------------------------- |
| **Object Key** | R2/S3에서 파일을 식별하는 고유 경로           | `materials/abc-123/file.pdf` |
| **Signed URL** | 제한된 시간 동안만 유효한 인증된 URL          | 파일 다운로드 링크           |
| **Migration**  | 데이터베이스 스키마 변경을 버전 관리하는 과정 | Drizzle migration            |
| **Seed Data**  | 초기 데이터 또는 테스트 데이터                | 샘플 학습 자료 및 계획       |

---

## 보안 용어

| 용어                 | 정의                                                         | 대응                     |
| -------------------- | ------------------------------------------------------------ | ------------------------ |
| **CSRF**             | Cross-Site Request Forgery, 사용자 권한으로 악의적 요청 수행 | CSRF 토큰 검증           |
| **XSS**              | Cross-Site Scripting, 악성 스크립트 주입                     | 입력 이스케이프, CSP     |
| **Prompt Injection** | 악의적 프롬프트로 LLM 동작 조작 시도                         | 입력 검증, 컨텍스트 분리 |
| **PII**              | Personally Identifiable Information, 개인 식별 정보          | 로그 마스킹              |

---

## 관련 문서

- [제품 용어집](../01-overview/glossary.md)
- [시스템 아키텍처](./architecture.md)
- [데이터 모델](./data-models.md)
