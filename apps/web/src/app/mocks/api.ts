import { z } from "zod";

import { createSessionBlueprint } from "./blueprints";
import {
  ConceptReviewStatusSchema,
  DbSchema,
  DocumentKindSchema,
  IsoDateSchema,
  JsonValueSchema,
  PlanGoalSchema,
  PlanLevelSchema,
  PlanSchema,
  PlanStatusSchema,
  SpaceSchema,
  UserSchema,
} from "./schemas";
import { readDbOrSeed, writeDb } from "./store";

import type {
  Concept,
  ConceptReviewStatus,
  Db,
  Document,
  DocumentKind,
  Plan,
  PlanGoal,
  PlanLevel,
  PlanSession,
  PlanSessionStatus,
  PlanSessionType,
  SessionBlueprint,
  Space,
  User,
} from "./schemas";

import {
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
} from "~/foundation/lib/auth";
import { invariant } from "~/foundation/lib/invariant";
import { randomPublicId } from "~/foundation/lib/public-id";
import { nowIso, todayIsoDate } from "~/foundation/lib/time";
import { randomUuidV4 } from "~/foundation/lib/uuid";

export type HomeQueueItem = {
  sessionId: string;
  spaceId: string;
  spaceName: string;
  planId: string;
  planTitle: string;
  moduleTitle: string;
  sessionTitle: string;
  type: PlanSessionType;
  status: PlanSessionStatus;
  scheduledDate: string;
  durationMinutes: number;
  spaceIcon: string;
  spaceColor: string;
};

export type SessionSummaryCard = {
  sessionId: string;
  planId: string;
  spaceId: string;
  moduleTitle: string;
  sessionTitle: string;
  completedAt: string;
  durationMinutes: number;
  conceptCount: number;
};

type PlanWithDerived = Plan & {
  progressPercent: number;
  totalSessions: number;
};

const SessionInputsSchema = z.record(z.string(), JsonValueSchema);

function readDb(): Db {
  const db = readDbOrSeed();
  const parsed = DbSchema.safeParse(db);
  invariant(parsed.success, "Mock DB is invalid");
  return parsed.data;
}

function commit(db: Db): void {
  writeDb(db);
}

function requireUser(db: Db): User {
  const session = readAuthSession();
  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }
  const user = db.user;
  if (!user || user.id !== session.userId) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}

function findSpace(db: Db, spaceId: string): Space | undefined {
  return db.spaces.find((s) => s.id === spaceId);
}

function requireSpace(db: Db, spaceId: string): Space {
  const space = findSpace(db, spaceId);
  if (!space) {
    throw new Error("NOT_FOUND_SPACE");
  }
  return space;
}

function requirePlan(db: Db, planId: string): Plan {
  const plan = db.plans.find((p) => p.id === planId);
  if (!plan) {
    throw new Error("NOT_FOUND_PLAN");
  }
  return plan;
}

function requireConcept(db: Db, conceptId: string): Concept {
  const concept = db.concepts.find((c) => c.id === conceptId);
  if (!concept) {
    throw new Error("NOT_FOUND_CONCEPT");
  }
  return concept;
}

function requireSessionBlueprint(
  db: Db,
  blueprintId: string,
): SessionBlueprint {
  const blueprint = db.sessionBlueprints.find(
    (b) => b.blueprintId === blueprintId,
  );
  if (!blueprint) {
    throw new Error("NOT_FOUND_BLUEPRINT");
  }
  return blueprint;
}

function mutateDocumentsForAnalysis(db: Db, now: Date): boolean {
  let changed = false;
  for (const doc of db.documents) {
    if (doc.status !== "analyzing" || !doc.analysisReadyAt) {
      continue;
    }
    const ready = new Date(doc.analysisReadyAt);
    if (!Number.isFinite(ready.getTime())) {
      continue;
    }
    if (ready.getTime() <= now.getTime()) {
      doc.status = "completed";
      doc.summary =
        doc.summary ??
        "자동 분석이 완료되었습니다. 요약/태그를 기반으로 Plan을 생성할 수 있습니다.";
      doc.tags = doc.tags.length > 0 ? doc.tags : ["learning", "notes"];
      doc.analysisReadyAt = undefined;
      doc.updatedAt = now.toISOString();
      changed = true;
    }
  }
  return changed;
}

function computePlanProgressPercent(plan: Plan): number {
  const sessions = plan.modules.flatMap((m) => m.sessions);
  if (sessions.length === 0) {
    return 0;
  }
  const completed = sessions.filter((s) => s.status === "completed").length;
  return Math.round((completed / sessions.length) * 100);
}

function withDerivedPlan(plan: Plan): PlanWithDerived {
  const sessions = plan.modules.flatMap((m) => m.sessions);
  return {
    ...plan,
    totalSessions: sessions.length,
    progressPercent: computePlanProgressPercent(plan),
  };
}

function findSessionInPlan(
  plan: Plan,
  sessionId: string,
): { moduleTitle: string; session: PlanSession } | null {
  for (const module of plan.modules) {
    const session = module.sessions.find((s) => s.id === sessionId);
    if (session) {
      return { moduleTitle: module.title, session };
    }
  }
  return null;
}

function nextIsoDateAfter(daysFromToday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function pickReviewStatusByAge(): ConceptReviewStatus {
  const value = Math.random();
  if (value < 0.2) return "due";
  if (value < 0.6) return "soon";
  return "good";
}

export function authStatus(): { isAuthenticated: boolean; user: User | null } {
  const db = readDb();
  const session = readAuthSession();
  if (!session || !db.user || db.user.id !== session.userId) {
    return { isAuthenticated: false, user: null };
  }
  return { isAuthenticated: true, user: db.user };
}

export function signInWithGoogle(): User {
  const db = readDb();
  const userId = db.user?.id ?? randomUuidV4();
  const user: User = db.user ?? {
    id: userId,
    name: "홍길동",
    email: "hong@example.com",
    plan: "free",
  };
  const validated = UserSchema.parse(user);
  db.user = validated;
  writeAuthSession({ userId: validated.id });
  commit(db);
  return validated;
}

export function requestMagicLink(email: string): { email: string } {
  const parsedEmail = z.string().email().parse(email);
  // For mock: no actual send, just return OK.
  return { email: parsedEmail };
}

export function logout(): void {
  clearAuthSession();
}

export function listSpaces(): Array<Space> {
  const db = readDb();
  requireUser(db);
  return db.spaces.map((s) => SpaceSchema.parse(s));
}

export function createSpace(input: {
  name: string;
  description?: string;
}): Space {
  const db = readDb();
  requireUser(db);

  const name = z.string().min(1).max(50).parse(input.name.trim());
  const description =
    input.description && input.description.trim().length > 0
      ? z.string().min(1).max(200).parse(input.description.trim())
      : undefined;

  const now = nowIso();
  const space: Space = {
    id: randomPublicId(),
    name,
    description,
    icon: "book",
    color: "blue",
    createdAt: now,
    updatedAt: now,
    activePlanId: undefined,
  };
  const validated = SpaceSchema.parse(space);
  db.spaces.unshift(validated);
  commit(db);
  return validated;
}

export function updateSpace(input: {
  spaceId: string;
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
}): Space {
  const db = readDb();
  requireUser(db);
  const space = requireSpace(db, input.spaceId);

  if (input.name !== undefined) {
    space.name = z.string().min(1).max(50).parse(input.name.trim());
  }
  if (input.description !== undefined) {
    space.description =
      input.description.trim().length > 0
        ? z.string().min(1).max(200).parse(input.description.trim())
        : undefined;
  }
  if (input.icon !== undefined) {
    space.icon = z.string().min(1).max(50).parse(input.icon);
  }
  if (input.color !== undefined) {
    space.color = z.string().min(1).max(20).parse(input.color);
  }

  space.updatedAt = nowIso();
  commit(db);
  return SpaceSchema.parse(space);
}

export function getSpace(spaceId: string): Space {
  const db = readDb();
  requireUser(db);
  return SpaceSchema.parse(requireSpace(db, spaceId));
}

export function listDocuments(spaceId: string): Array<Document> {
  const db = readDb();
  requireUser(db);
  requireSpace(db, spaceId);

  const changed = mutateDocumentsForAnalysis(db, new Date());
  if (changed) {
    commit(db);
  }

  return db.documents
    .filter((d) => d.spaceId === spaceId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function uploadDocument(input: {
  spaceId: string;
  kind: DocumentKind;
  title: string;
  source:
    | { type: "file"; fileName: string; fileSizeBytes?: number }
    | { type: "url"; url: string }
    | { type: "text"; text: string };
}): Document {
  const db = readDb();
  requireUser(db);
  requireSpace(db, input.spaceId);

  const kind = DocumentKindSchema.parse(input.kind);
  const title = z.string().min(1).max(120).parse(input.title.trim());

  const now = nowIso();
  const analysisReadyAt = new Date();
  analysisReadyAt.setSeconds(analysisReadyAt.getSeconds() + 3);

  const base: Omit<Document, "source"> = {
    id: randomUuidV4(),
    spaceId: input.spaceId,
    title,
    kind,
    status: "analyzing",
    summary: undefined,
    tags: [],
    createdAt: now,
    updatedAt: now,
    analysisReadyAt: analysisReadyAt.toISOString(),
  };

  const source = (() => {
    if (input.source.type === "file") {
      return {
        type: "file" as const,
        fileName: z.string().min(1).max(120).parse(input.source.fileName),
        fileSizeBytes:
          input.source.fileSizeBytes !== undefined
            ? z.number().int().nonnegative().parse(input.source.fileSizeBytes)
            : undefined,
      };
    }
    if (input.source.type === "url") {
      return {
        type: "url" as const,
        url: z.string().url().parse(input.source.url),
      };
    }
    return {
      type: "text" as const,
      textPreview: z
        .string()
        .min(1)
        .max(200)
        .parse(input.source.text.trim().slice(0, 200)),
    };
  })();

  const document: Document = {
    ...base,
    source,
  };

  db.documents.unshift(document);
  commit(db);
  return document;
}

export function deleteDocument(input: {
  spaceId: string;
  documentId: string;
}): void {
  const db = readDb();
  requireUser(db);
  requireSpace(db, input.spaceId);
  db.documents = db.documents.filter(
    (d) => !(d.spaceId === input.spaceId && d.id === input.documentId),
  );
  commit(db);
}

export function listPlans(spaceId: string): Array<PlanWithDerived> {
  const db = readDb();
  requireUser(db);
  requireSpace(db, spaceId);
  return db.plans
    .filter((p) => p.spaceId === spaceId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((p) => withDerivedPlan(PlanSchema.parse(p)));
}

export function getPlan(planId: string): PlanWithDerived {
  const db = readDb();
  requireUser(db);
  return withDerivedPlan(PlanSchema.parse(requirePlan(db, planId)));
}

export function setPlanStatus(input: {
  planId: string;
  status: "active" | "paused" | "archived";
}): PlanWithDerived {
  const db = readDb();
  requireUser(db);
  const plan = requirePlan(db, input.planId);
  const status = PlanStatusSchema.parse(input.status);
  plan.status = status;
  plan.updatedAt = nowIso();

  // Space-level active plan should stay consistent.
  const space = requireSpace(db, plan.spaceId);
  if (status === "active") {
    space.activePlanId = plan.id;
  } else if (space.activePlanId === plan.id) {
    space.activePlanId = undefined;
  }
  space.updatedAt = nowIso();

  commit(db);
  return withDerivedPlan(PlanSchema.parse(plan));
}

export function setActivePlan(input: {
  spaceId: string;
  planId: string;
}): void {
  const db = readDb();
  requireUser(db);
  const space = requireSpace(db, input.spaceId);
  const plan = requirePlan(db, input.planId);
  invariant(plan.spaceId === input.spaceId, "Plan does not belong to space");

  for (const p of db.plans) {
    if (p.spaceId !== input.spaceId) continue;
    if (p.id === input.planId) {
      p.status = "active";
      p.updatedAt = nowIso();
    } else if (p.status === "active") {
      p.status = "paused";
      p.updatedAt = nowIso();
    }
  }

  space.activePlanId = input.planId;
  space.updatedAt = nowIso();
  commit(db);
}

export function createPlan(input: {
  spaceId: string;
  sourceDocumentIds: Array<string>;
  goal: PlanGoal;
  level: PlanLevel;
  durationMode: "custom" | "adaptive";
  durationValue?: number;
  durationUnit?: "days" | "weeks" | "months";
  notes?: string;
}): PlanWithDerived {
  const db = readDb();
  requireUser(db);
  const space = requireSpace(db, input.spaceId);

  const sourceDocumentIds = z
    .array(z.string().uuid())
    .min(1)
    .max(5)
    .parse(input.sourceDocumentIds);
  const goal = PlanGoalSchema.parse(input.goal);
  const level = PlanLevelSchema.parse(input.level);

  const documents = db.documents.filter(
    (d) => d.spaceId === input.spaceId && sourceDocumentIds.includes(d.id),
  );
  if (documents.length !== sourceDocumentIds.length) {
    throw new Error("INVALID_DOCUMENT_SELECTION");
  }
  if (documents.some((d) => d.status !== "completed")) {
    throw new Error("DOCUMENTS_NOT_READY");
  }

  const now = nowIso();
  const planId = randomPublicId();
  const module1Id = randomUuidV4();
  const module2Id = randomUuidV4();

  const today = todayIsoDate();
  const schedule = [
    today,
    nextIsoDateAfter(1),
    nextIsoDateAfter(2),
    nextIsoDateAfter(3),
  ];

  const tagSeed = documents.flatMap((d) => d.tags).slice(0, 4);
  const module1Title = tagSeed[0]
    ? `Module 1: ${tagSeed[0]}`
    : "Module 1: Foundations";
  const module2Title = tagSeed[1]
    ? `Module 2: ${tagSeed[1]}`
    : "Module 2: Practice";

  const session1Id = randomPublicId();
  const session2Id = randomPublicId();
  const session3Id = randomPublicId();
  const session4Id = randomPublicId();

  const planTitle = `${space.name} Plan`;

  const blueprint1 = createSessionBlueprint({
    planId,
    moduleId: module1Id,
    planSessionId: session1Id,
    sessionType: "session",
    planTitle,
    moduleTitle: module1Title,
    sessionTitle: "Session 1: 핵심 개념",
    targetMinutes: 30,
    level,
    nextSessionTitle: "Review 1: 개념 점검",
  });
  const blueprint2 = createSessionBlueprint({
    planId,
    moduleId: module1Id,
    planSessionId: session2Id,
    sessionType: "review",
    planTitle,
    moduleTitle: module1Title,
    sessionTitle: "Review 1: 개념 점검",
    targetMinutes: 15,
    level,
    nextSessionTitle: "Session 2: 적용 연습",
  });
  const blueprint3 = createSessionBlueprint({
    planId,
    moduleId: module2Id,
    planSessionId: session3Id,
    sessionType: "session",
    planTitle,
    moduleTitle: module2Title,
    sessionTitle: "Session 2: 적용 연습",
    targetMinutes: 30,
    level,
    nextSessionTitle: "Review 2: 회고",
  });
  const blueprint4 = createSessionBlueprint({
    planId,
    moduleId: module2Id,
    planSessionId: session4Id,
    sessionType: "review",
    planTitle,
    moduleTitle: module2Title,
    sessionTitle: "Review 2: 회고",
    targetMinutes: 15,
    level,
  });

  const plan: Plan = {
    id: planId,
    spaceId: input.spaceId,
    title: `${space.name} Plan`,
    goal,
    level,
    status: "active",
    createdAt: now,
    updatedAt: now,
    sourceDocumentIds,
    modules: [
      {
        id: module1Id,
        title: module1Title,
        summary: "핵심 개념을 빠르게 정리하고 안정적인 이해를 만듭니다.",
        sessions: [
          {
            id: session1Id,
            moduleId: module1Id,
            blueprintId: blueprint1.blueprintId,
            title: "Session 1: 핵심 개념",
            type: "session",
            scheduledDate: schedule[0],
            durationMinutes: 30,
            status: "todo",
            conceptIds: [],
          },
          {
            id: session2Id,
            moduleId: module1Id,
            blueprintId: blueprint2.blueprintId,
            title: "Review 1: 개념 점검",
            type: "review",
            scheduledDate: schedule[1],
            durationMinutes: 15,
            status: "todo",
            conceptIds: [],
          },
        ],
      },
      {
        id: module2Id,
        title: module2Title,
        summary: "적용과 복습으로 장기 기억을 강화합니다.",
        sessions: [
          {
            id: session3Id,
            moduleId: module2Id,
            blueprintId: blueprint3.blueprintId,
            title: "Session 2: 적용 연습",
            type: "session",
            scheduledDate: schedule[2],
            durationMinutes: 30,
            status: "todo",
            conceptIds: [],
          },
          {
            id: session4Id,
            moduleId: module2Id,
            blueprintId: blueprint4.blueprintId,
            title: "Review 2: 회고",
            type: "review",
            scheduledDate: schedule[3],
            durationMinutes: 15,
            status: "todo",
            conceptIds: [],
          },
        ],
      },
    ],
  };

  db.sessionBlueprints.unshift(blueprint1, blueprint2, blueprint3, blueprint4);
  db.plans.unshift(plan);
  space.activePlanId = plan.id;
  space.updatedAt = nowIso();
  commit(db);

  return withDerivedPlan(plan);
}

export function homeQueue(): Array<HomeQueueItem> {
  const db = readDb();
  requireUser(db);

  const today = todayIsoDate();

  const activePlans = db.plans.filter((p) => p.status === "active");
  const spacesById = new Map(db.spaces.map((s) => [s.id, s] as const));

  const items: Array<HomeQueueItem> = [];
  for (const plan of activePlans) {
    const space = spacesById.get(plan.spaceId);
    if (!space) continue;

    for (const module of plan.modules) {
      for (const session of module.sessions) {
        if (session.status === "completed") continue;
        if (session.scheduledDate > today) continue;
        items.push({
          sessionId: session.id,
          spaceId: space.id,
          spaceName: space.name,
          planId: plan.id,
          planTitle: plan.title,
          moduleTitle: module.title,
          sessionTitle: session.title,
          type: session.type,
          status: session.status,
          scheduledDate: session.scheduledDate,
          durationMinutes: session.durationMinutes,
          spaceIcon: space.icon ?? "book",
          spaceColor: space.color ?? "blue",
        });
      }
    }
  }

  return items.sort((a, b) => {
    if (a.scheduledDate === b.scheduledDate) {
      return a.planTitle.localeCompare(b.planTitle);
    }
    return a.scheduledDate.localeCompare(b.scheduledDate);
  });
}

export function recentSessions(limit: number): Array<SessionSummaryCard> {
  const db = readDb();
  requireUser(db);

  const cards: Array<SessionSummaryCard> = [];
  for (const plan of db.plans) {
    for (const module of plan.modules) {
      for (const session of module.sessions) {
        if (session.status !== "completed" || !session.completedAt) continue;
        cards.push({
          sessionId: session.id,
          planId: plan.id,
          spaceId: plan.spaceId,
          moduleTitle: module.title,
          sessionTitle: session.title,
          completedAt: session.completedAt,
          durationMinutes: session.durationMinutes,
          conceptCount: session.conceptIds.length,
        });
      }
    }
  }

  // If we don't have enough real data, fill with mocks for UI testing
  if (cards.length < limit) {
    const now = new Date();
    const mockTopics = [
      { module: "React Performance", session: "Render Optimization" },
      { module: "TypeScript Advanced", session: "Conditional Types" },
      { module: "System Design", session: "Caching Strategies" },
      { module: "CSS Architecture", session: "Tailwind Best Practices" },
      { module: "Node.js Internal", session: "Event Loop Deep Dive" },
      { module: "Database Design", session: "Normalization Forms" },
    ];

    for (let i = 0; i < limit - cards.length; i++) {
      const topic = mockTopics[i % mockTopics.length];
      if (!topic) continue;

      // Distribute dates over the last month (approx 30 days)
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(
        Math.floor(Math.random() * 12) + 9,
        Math.floor(Math.random() * 60),
      ); // Random time between 9am-9pm

      cards.push({
        sessionId: `mock-session-${i}`,
        planId: `mock-plan-${i}`,
        spaceId: `mock-space-${i}`,
        moduleTitle: topic.module,
        sessionTitle: topic.session,
        completedAt: date.toISOString(),
        durationMinutes: 15 + Math.floor(Math.random() * 45), // 15-60 min
        conceptCount: 3 + Math.floor(Math.random() * 7), // 3-10 concepts
      });
    }
  }

  return cards
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, Math.max(0, Math.min(10, limit)));
}

export function listConcepts(input?: {
  spaceId?: string;
  query?: string;
  reviewStatus?: ConceptReviewStatus;
  sessionId?: string;
}): Array<Concept> {
  const db = readDb();
  requireUser(db);

  const query = input?.query?.trim().toLowerCase() ?? "";
  const reviewStatus = input?.reviewStatus
    ? ConceptReviewStatusSchema.parse(input.reviewStatus)
    : undefined;

  return db.concepts
    .filter((c) => (input?.spaceId ? c.spaceId === input.spaceId : true))
    .filter((c) => (reviewStatus ? c.reviewStatus === reviewStatus : true))
    .filter((c) => {
      if (!input?.sessionId) return true;
      return c.sources.some((s) => s.sessionId === input.sessionId);
    })
    .filter((c) => {
      if (!query) return true;
      const hay =
        `${c.title} ${c.oneLiner} ${c.definition} ${c.tags.join(" ")}`.toLowerCase();
      return hay.includes(query);
    })
    .slice()
    .sort((a, b) => b.lastStudiedAt.localeCompare(a.lastStudiedAt));
}

export function getConcept(conceptId: string): Concept {
  const db = readDb();
  requireUser(db);
  return requireConcept(db, conceptId);
}

export function getPlanBySpaceActive(spaceId: string): PlanWithDerived | null {
  const db = readDb();
  requireUser(db);
  const space = requireSpace(db, spaceId);
  if (!space.activePlanId) return null;
  const plan = db.plans.find((p) => p.id === space.activePlanId);
  if (!plan) return null;
  return withDerivedPlan(plan);
}

export function planNextQueue(
  planId: string,
  limit: number,
): Array<HomeQueueItem> {
  const db = readDb();
  requireUser(db);
  const plan = requirePlan(db, planId);
  const space = requireSpace(db, plan.spaceId);

  const today = todayIsoDate();

  const items: Array<HomeQueueItem> = [];
  for (const module of plan.modules) {
    for (const session of module.sessions) {
      if (session.status === "completed") continue;
      if (session.scheduledDate > today) continue;
      items.push({
        sessionId: session.id,
        spaceId: space.id,
        spaceName: space.name,
        planId: plan.id,
        planTitle: plan.title,
        moduleTitle: module.title,
        sessionTitle: session.title,
        type: session.type,
        status: session.status,
        scheduledDate: session.scheduledDate,
        durationMinutes: session.durationMinutes,
        spaceIcon: space.icon ?? "book",
        spaceColor: space.color ?? "blue",
      });
    }
  }

  return items
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, Math.max(0, Math.min(5, limit)));
}

export function startSession(input: {
  planId: string;
  sessionId: string;
  isRecovery?: boolean;
}): { runId: string } {
  const db = readDb();
  requireUser(db);

  const plan = requirePlan(db, input.planId);
  const found = findSessionInPlan(plan, input.sessionId);
  if (!found) {
    throw new Error("NOT_FOUND_SESSION");
  }

  if (plan.status !== "active") {
    throw new Error("PLAN_NOT_ACTIVE");
  }

  const existing = db.sessionRuns.find(
    (r) =>
      r.planId === plan.id &&
      r.sessionId === input.sessionId &&
      r.status !== "COMPLETED",
  );
  if (existing) {
    existing.isRecovery = true;
    existing.updatedAt = nowIso();
    commit(db);
    return { runId: existing.runId };
  }

  if (found.session.status === "todo") {
    found.session.status = "in_progress";
  }

  const runId = randomPublicId();
  const createdAt = nowIso();

  const blueprint = requireSessionBlueprint(db, found.session.blueprintId);

  const run = {
    runId,
    planId: plan.id,
    sessionId: input.sessionId,
    blueprintId: blueprint.blueprintId,
    isRecovery: input.isRecovery ?? false,
    createdAt,
    updatedAt: createdAt,
    currentStepId: blueprint.startStepId,
    stepHistory: [blueprint.startStepId],
    historyIndex: 0,
    inputs: {},
    createdConceptIds: [],
    status: "ACTIVE" as const,
  };

  db.sessionRuns = db.sessionRuns.filter(
    (r) =>
      !(
        r.planId === plan.id &&
        r.sessionId === input.sessionId &&
        r.status !== "COMPLETED"
      ),
  );
  db.sessionRuns.unshift(run);
  commit(db);

  return { runId };
}

export function getSessionRun(runId: string) {
  const db = readDb();
  requireUser(db);
  const run = db.sessionRuns.find((r) => r.runId === runId);
  if (!run) {
    throw new Error("NOT_FOUND_RUN");
  }

  // Enrich with plan and session title info
  const plan = db.plans.find((p) => p.id === run.planId);
  let planTitle = "";
  let moduleTitle = "";
  let sessionTitle = "";

  if (plan) {
    planTitle = plan.title;
    const found = findSessionInPlan(plan, run.sessionId);
    if (found) {
      moduleTitle = found.moduleTitle;
      sessionTitle = found.session.title;
    }
  }

  const blueprint = requireSessionBlueprint(db, run.blueprintId);

  return {
    ...run,
    planTitle,
    moduleTitle,
    sessionTitle,
    blueprint,
  };
}

export function saveSessionProgress(input: {
  runId: string;
  currentStepId: string;
  stepHistory: Array<string>;
  historyIndex: number;
  inputs: Record<string, unknown>;
}): void {
  const db = readDb();
  requireUser(db);
  const run = db.sessionRuns.find((r) => r.runId === input.runId);
  if (!run) return;
  if (run.status === "COMPLETED") return;
  const parsedInputs = SessionInputsSchema.safeParse(input.inputs);
  if (!parsedInputs.success) return;
  const stepHistory = input.stepHistory
    .map(String)
    .filter(Boolean)
    .slice(0, 200);
  if (stepHistory.length > 0) {
    run.stepHistory = stepHistory;
  }
  run.currentStepId = String(input.currentStepId);
  run.historyIndex = Math.max(
    0,
    Math.min(run.stepHistory.length - 1, Math.floor(input.historyIndex)),
  );
  run.inputs = parsedInputs.data;
  run.updatedAt = nowIso();
  commit(db);
}

export function completeSession(input: { runId: string }): {
  createdConceptIds: Array<string>;
} {
  const db = readDb();
  requireUser(db);

  const run = db.sessionRuns.find((r) => r.runId === input.runId);
  if (!run) {
    throw new Error("NOT_FOUND_RUN");
  }
  if (run.status === "COMPLETED") {
    return { createdConceptIds: run.createdConceptIds };
  }

  const plan = requirePlan(db, run.planId);
  const found = findSessionInPlan(plan, run.sessionId);
  if (!found) {
    throw new Error("NOT_FOUND_SESSION");
  }

  const exampleCode = (() => {
    const code = run.inputs.code;
    if (code && typeof code === "object" && !Array.isArray(code)) {
      for (const value of Object.values(code as Record<string, unknown>)) {
        if (typeof value === "string" && value.trim().length > 0) {
          return value.trim().slice(0, 500);
        }
      }
    }

    const practice = run.inputs.practice;
    if (practice && typeof practice === "object" && !Array.isArray(practice)) {
      for (const value of Object.values(practice as Record<string, unknown>)) {
        if (typeof value === "string" && value.trim().length > 0) {
          return value.trim().slice(0, 500);
        }
      }
    }

    return undefined;
  })();

  const createdAt = nowIso();
  const titles = [
    `${found.session.title}: 핵심 정의`,
    `${found.session.title}: 주의사항`,
  ];

  const createdConceptIds: Array<string> = [];
  for (const title of titles) {
    const id = randomPublicId();
    const concept: Concept = {
      id,
      spaceId: plan.spaceId,
      title,
      oneLiner: "세션에서 생성된 핵심 개념을 한 줄로 요약합니다.",
      definition:
        "이 개념은 세션에서 자동으로 추출/정리되었습니다. 정의와 예제, 주의사항을 중심으로 빠르게 복습할 수 있도록 구성됩니다.",
      exampleCode,
      gotchas: ["복습 필요도에 따라 다시 확인해보세요."],
      tags: ["auto", "concept"],
      reviewStatus: pickReviewStatusByAge(),
      lastStudiedAt: createdAt,
      sources: [
        {
          planId: plan.id,
          sessionId: run.sessionId,
          moduleTitle: found.moduleTitle,
          sessionTitle: found.session.title,
          studiedAt: createdAt,
        },
      ],
      relatedConceptIds: [],
    };
    db.concepts.unshift(concept);
    createdConceptIds.push(id);
  }

  found.session.status = "completed";
  found.session.completedAt = createdAt;
  found.session.conceptIds = Array.from(
    new Set([...(found.session.conceptIds ?? []), ...createdConceptIds]),
  );

  run.status = "COMPLETED";
  run.createdConceptIds = createdConceptIds;
  run.updatedAt = createdAt;

  commit(db);
  return { createdConceptIds };
}

export function statsForHome(): {
  remainingCount: number;
  completedCountToday: number;
  estimatedMinutes: number;
  streakDays: number;
  coachingMessage: string;
} {
  const db = readDb();
  requireUser(db);

  const today = todayIsoDate();
  const queue = homeQueue();
  const remainingCount = queue.length;
  const estimatedMinutes = queue.reduce(
    (sum, item) => sum + item.durationMinutes,
    0,
  );

  const completedAtDates: Array<string> = [];
  for (const plan of db.plans) {
    for (const module of plan.modules) {
      for (const session of module.sessions) {
        if (session.status !== "completed" || !session.completedAt) continue;
        completedAtDates.push(session.completedAt);
      }
    }
  }

  const completedCountToday = completedAtDates.filter((iso) =>
    iso.startsWith(today),
  ).length;

  const datesSet = new Set(completedAtDates.map((iso) => iso.slice(0, 10)));
  let streakDays = 0;
  for (let offset = 0; offset < 365; offset += 1) {
    const d = nextIsoDateAfter(-offset);
    if (!datesSet.has(d)) break;
    streakDays += 1;
  }

  const coachingMessage =
    remainingCount === 0
      ? "오늘 할 일을 모두 완료했어요. 내일도 같은 리듬으로 이어가볼까요?"
      : completedCountToday > 0
        ? "좋아요. 이미 시작했네요. 남은 큐도 가볍게 이어가봅시다."
        : "오늘은 딱 한 번만 시작해보세요. 시작이 끝의 절반입니다.";

  return {
    remainingCount,
    completedCountToday,
    estimatedMinutes,
    streakDays,
    coachingMessage,
  };
}

export function parseIsoDateOrThrow(value: string): string {
  return IsoDateSchema.parse(value);
}
