# 학습 퀴즈 기능 메모

## 개요

- 세부 목표(LearningTask) 상세 페이지에 `학습 퀴즈` 탭을 추가.
- 사용자가 버튼을 누르면 AI가 4~20개의 객관식 문항을 생성한다.
- 모든 문항에 답변하고 제출하면 서버에서 채점·정답 해설을 저장하며, 제출 전까지는 어떤 결과도 저장하지 않는다.

## 백엔드 변경 사항

- **데이터 모델**
  - `ai_quiz` 테이블: 세부 목표와 1:N 관계, 상태/요청 시각/생성된 문항(JSONB) 저장.
  - `ai_quiz_result` 테이블: 각 퀴즈 제출 내역, 사용자·정답 수·응답 상세(JSONB)를 보관.
- **서비스**
  - `prepareLearningTaskQuizGeneration`: 권한 검사 → 퀴즈 생성 요청 → 필요 시 새 레코드 생성 후 비동기 작업 등록.
  - `runLearningTaskQuizGeneration`: Google Gemini 모델로 질문/보기/정답 해설을 생성하고 테이블 업데이트.
  - `submitLearningTaskQuiz`: 모든 문항에 대한 답안을 검증하고 채점 결과/해설을 저장.
- **엔드포인트**
  - `POST /ai/learningPlans/:learningPlanId/learning-tasks/:learningTaskId/quizzes` — 퀴즈 생성/재생성 요청.
  - `POST /learningPlans/:learningPlanId/learning-tasks/:learningTaskId/quizzes/:quizId/submissions` — 답안 제출 및 채점.
  - `GET /learningPlans/:learningPlanId/learning-tasks/:learningTaskId` 응답에 최신 퀴즈 정보(`aiQuiz`) 포함.

## 프런트엔드 변경 사항

- `LearningTaskDetail` 타입에 `aiQuiz` 필드를 추가하고 http-client에 생성/제출 API를 연결.
- 세부 목표 페이지에 `학습 퀴즈` 탭을 구현.
  - 상태 배지 및 최근 요청/완료 정보 표시.
  - 상태에 따라 안내, 오류, 스피너 메시지를 보여준다.
  - 퀴즈가 준비되면 각 문항의 보기(4개)와 선택 UI를 렌더링.
  - 모든 문항을 선택하면 `결과 제출` 버튼이 활성화되며, 제출 후 정답/오답/해설을 하이라이트한다.
- React Query로 기존 상세 쿼리를 무효화하여 최신 데이터(새 퀴즈, 채점 결과)를 반영.

## 향후 체크리스트

- 서버 측 로깅/관찰 포인트(퀴즈 생성 실패율, 제출 실패율) 추가 여부 검토.
- E2E 테스트(퀴즈 생성→제출 플로우) 자동화 검토.
- 다국어 번역이 필요한 경우 메시지를 i18n 자원으로 이동.
