import { createSessionBlueprint } from "./blueprints";
import { DbSchema } from "./schemas";

import type { Db } from "./schemas";

import { readJsonFromStorage, writeJsonToStorage } from "~/lib/storage";
import { nowIso, todayIsoDate } from "~/lib/time";
import { randomUuidV4 } from "~/lib/uuid";

const DB_KEY = "tlm_mock_db_v1";

function emptyDb(): Db {
  return {
    version: 0,
    user: undefined,
    spaces: [],
    documents: [],
    plans: [],
    concepts: [],
    sessionBlueprints: [],
    sessionRuns: [],
  };
}

function seededDb(): Db {
  const createdAt = nowIso();

  const userId = randomUuidV4();
  const spaceWorkId = randomUuidV4();
  const spaceHobbyId = randomUuidV4();

  const document1Id = randomUuidV4();
  const document2Id = randomUuidV4();
  const document3Id = randomUuidV4();

  const planId = randomUuidV4();
  const module1Id = randomUuidV4();
  const module2Id = randomUuidV4();
  const session1Id = randomUuidV4();
  const session2Id = randomUuidV4();
  const session3Id = randomUuidV4();
  const session4Id = randomUuidV4();

  const concept1Id = randomUuidV4();
  const concept2Id = randomUuidV4();
  const concept3Id = randomUuidV4();

  const today = todayIsoDate();
  const tomorrow = (() => {
    const dt = new Date();
    dt.setDate(dt.getDate() + 1);
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();

  const module1Title = "Module 1: State & Effects";
  const module2Title = "Module 2: Data Fetching";
  const planTitle = "React Hooks 마스터";

  const blueprint1 = createSessionBlueprint({
    planId,
    moduleId: module1Id,
    planSessionId: session1Id,
    sessionType: "session",
    planTitle,
    moduleTitle: module1Title,
    sessionTitle: "Session 1: useState",
    targetMinutes: 30,
    level: "basic",
    nextSessionTitle: "Review 1: State 업데이트 규칙",
  });
  const blueprint2 = createSessionBlueprint({
    planId,
    moduleId: module1Id,
    planSessionId: session2Id,
    sessionType: "review",
    planTitle,
    moduleTitle: module1Title,
    sessionTitle: "Review 1: State 업데이트 규칙",
    targetMinutes: 15,
    level: "basic",
    nextSessionTitle: "Session 2: Suspense 기본",
  });
  const blueprint3 = createSessionBlueprint({
    planId,
    moduleId: module2Id,
    planSessionId: session3Id,
    sessionType: "session",
    planTitle,
    moduleTitle: module2Title,
    sessionTitle: "Session 2: Suspense 기본",
    targetMinutes: 30,
    level: "basic",
    nextSessionTitle: "Review 2: 에러 경계",
  });
  const blueprint4 = createSessionBlueprint({
    planId,
    moduleId: module2Id,
    planSessionId: session4Id,
    sessionType: "review",
    planTitle,
    moduleTitle: module2Title,
    sessionTitle: "Review 2: 에러 경계",
    targetMinutes: 15,
    level: "basic",
  });

  return {
    version: 2,
    user: {
      id: userId,
      name: "홍길동",
      email: "hong@example.com",
      plan: "free",
    },
    spaces: [
      {
        id: spaceWorkId,
        name: "Work",
        description: "실무 중심 학습",
        icon: "briefcase",
        color: "blue",
        createdAt,
        updatedAt: createdAt,
        activePlanId: planId,
      },
      {
        id: spaceHobbyId,
        name: "Hobby",
        description: "흥미 기반 학습",
        icon: "music",
        color: "purple",
        createdAt,
        updatedAt: createdAt,
        activePlanId: undefined,
      },
    ],
    documents: [
      {
        id: document1Id,
        spaceId: spaceWorkId,
        title: "React Hooks 정리 (URL)",
        kind: "url",
        status: "completed",
        summary: "Hooks의 핵심 패턴과 실무에서 자주 쓰는 케이스를 요약합니다.",
        tags: ["react", "hooks"],
        createdAt,
        updatedAt: createdAt,
        source: { type: "url", url: "https://react.dev/reference/react" },
      },
      {
        id: document2Id,
        spaceId: spaceWorkId,
        title: "TypeScript 실전 노트 (텍스트)",
        kind: "text",
        status: "completed",
        summary: "타입 설계와 좁히기, 런타임 검증을 중심으로 정리합니다.",
        tags: ["typescript", "zod"],
        createdAt,
        updatedAt: createdAt,
        source: {
          type: "text",
          textPreview: "타입은 컴파일 타임, 검증은 런타임...",
        },
      },
      {
        id: document3Id,
        spaceId: spaceHobbyId,
        title: "기타 코드 스케일 연습 (파일)",
        kind: "file",
        status: "completed",
        summary: "기초 스케일 패턴을 빠르게 반복 학습합니다.",
        tags: ["music", "practice"],
        createdAt,
        updatedAt: createdAt,
        source: {
          type: "file",
          fileName: "guitar-scales.pdf",
          fileSizeBytes: 123_456,
        },
      },
    ],
    plans: [
      {
        id: planId,
        spaceId: spaceWorkId,
        title: "React Hooks 마스터",
        goal: "work",
        level: "basic",
        status: "active",
        createdAt,
        updatedAt: createdAt,
        sourceDocumentIds: [document1Id, document2Id],
        modules: [
          {
            id: module1Id,
            title: module1Title,
            summary: "상태/이펙트의 핵심 개념과 안전한 사용 패턴",
            sessions: [
              {
                id: session1Id,
                moduleId: module1Id,
                blueprintId: blueprint1.blueprintId,
                title: "Session 1: useState",
                type: "session",
                scheduledDate: today,
                durationMinutes: 30,
                status: "todo",
                conceptIds: [],
              },
              {
                id: session2Id,
                moduleId: module1Id,
                blueprintId: blueprint2.blueprintId,
                title: "Review 1: State 업데이트 규칙",
                type: "review",
                scheduledDate: tomorrow,
                durationMinutes: 15,
                status: "todo",
                conceptIds: [],
              },
            ],
          },
          {
            id: module2Id,
            title: module2Title,
            summary: "데이터 페칭과 로딩/에러 UX",
            sessions: [
              {
                id: session3Id,
                moduleId: module2Id,
                blueprintId: blueprint3.blueprintId,
                title: "Session 2: Suspense 기본",
                type: "session",
                scheduledDate: tomorrow,
                durationMinutes: 30,
                status: "todo",
                conceptIds: [],
              },
              {
                id: session4Id,
                moduleId: module2Id,
                blueprintId: blueprint4.blueprintId,
                title: "Review 2: 에러 경계",
                type: "review",
                scheduledDate: tomorrow,
                durationMinutes: 15,
                status: "todo",
                conceptIds: [],
              },
            ],
          },
        ],
      },
    ],
    concepts: [
      {
        id: concept1Id,
        spaceId: spaceWorkId,
        title: "useState의 동작 원리",
        oneLiner:
          "컴포넌트 렌더 사이에 상태를 유지하고 업데이트를 스케줄합니다.",
        definition:
          "useState는 렌더링과 상태 업데이트를 분리합니다. 상태 업데이트는 즉시 반영되지 않을 수 있으며, React는 업데이트를 모아 렌더링을 최적화합니다.",
        exampleCode:
          "const [count, setCount] = useState(0);\nsetCount((prev) => prev + 1);",
        gotchas: ["상태를 직접 변경하지 말고 setter를 사용하세요."],
        tags: ["react", "hooks", "state"],
        reviewStatus: "soon",
        lastStudiedAt: createdAt,
        sources: [
          {
            planId,
            sessionId: session1Id,
            moduleTitle: "Module 1: State & Effects",
            sessionTitle: "Session 1: useState",
            studiedAt: createdAt,
          },
        ],
        relatedConceptIds: [concept2Id, concept3Id],
      },
      {
        id: concept2Id,
        spaceId: spaceWorkId,
        title: "상태 업데이트 함수형 패턴",
        oneLiner:
          "이전 값을 기반으로 안전하게 업데이트하려면 함수형 updater를 사용합니다.",
        definition:
          "동일한 이벤트 루프 안에서 여러 업데이트가 발생할 수 있으므로, 이전 값을 참조해야 할 때는 setState((prev) => next) 형태가 안전합니다.",
        exampleCode:
          "setCount((prev) => prev + 1);\nsetItems((prev) => [...prev, item]);",
        gotchas: ["배열/객체는 불변 업데이트를 유지하세요."],
        tags: ["react", "immutability"],
        reviewStatus: "good",
        lastStudiedAt: createdAt,
        sources: [
          {
            planId,
            sessionId: session1Id,
            moduleTitle: "Module 1: State & Effects",
            sessionTitle: "Session 1: useState",
            studiedAt: createdAt,
          },
        ],
        relatedConceptIds: [concept1Id],
      },
      {
        id: concept3Id,
        spaceId: spaceWorkId,
        title: "렌더링과 Side Effect의 분리",
        oneLiner: "렌더는 순수해야 하고, 부수효과는 Effect에서 처리합니다.",
        definition:
          "렌더링 과정에서 외부 상태를 변경하면 예측 불가능한 버그가 발생할 수 있습니다. 부수효과는 useEffect 등으로 옮겨 순수성을 유지합니다.",
        gotchas: ["Effect 의존성 배열을 정확히 관리하세요."],
        tags: ["react", "effects"],
        reviewStatus: "due",
        lastStudiedAt: createdAt,
        sources: [
          {
            planId,
            sessionId: session1Id,
            moduleTitle: "Module 1: State & Effects",
            sessionTitle: "Session 1: useState",
            studiedAt: createdAt,
          },
        ],
        relatedConceptIds: [concept1Id],
      },
    ],
    sessionBlueprints: [blueprint1, blueprint2, blueprint3, blueprint4],
    sessionRuns: [],
  };
}

export function readDbOrSeed(): Db {
  const db = readJsonFromStorage(DB_KEY, DbSchema);
  if (db) {
    return db;
  }
  const seeded = seededDb();
  writeJsonToStorage(DB_KEY, DbSchema, seeded);
  return seeded;
}

export function writeDb(db: Db): void {
  writeJsonToStorage(DB_KEY, DbSchema, db);
}

export function resetDb(): void {
  writeJsonToStorage(DB_KEY, DbSchema, emptyDb());
}
