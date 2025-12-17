# Data Retention 정책

## 개요

데이터 보존 기간, 계정 삭제 시 파기 범위, 백업/복구 원칙을 정의합니다.

---

## 보존 기간

| 데이터 유형       | 보존 기간    | 근거           |
| ----------------- | ------------ | -------------- |
| Raw File (R2)     | 계정 활성 중 | 원본 참조 필요 |
| Chunks/Embeddings | 계정 활성 중 | RAG 검색용     |
| Chat Log          | 1년          | 학습 이력      |
| Session Run       | 무기한       | 학습 통계      |
| Auth Sessions     | 30일         | 보안           |

---

## 계정 삭제 시 파기

### 즉시 삭제

- 인증 정보 (auth_sessions, magic_link_tokens)
- 개인 식별 정보 (email, display_name)

### 30일 후 삭제 (소프트 삭제 후)

- Spaces, Materials, Plans
- Concepts, Sessions
- Chat Threads

### 파기 순서

```
1. Users.deleted_at 설정
2. 연관 Spaces.deleted_at 설정
3. 30일 후 GC: 물리 삭제
```

---

## 백업 원칙

- 일일 백업 (NeonDB 자동)
- 7일 보관
- 복구: 지원 요청 시 수동

---

## 관련 문서

- [학습 자료 삭제 정책](./material-deletion.md)
