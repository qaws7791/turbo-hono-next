import { z } from "zod";

import { createSessionBlueprint } from "./blueprints";
import {
  DbSchema,
  IsoDateSchema,
  JsonValueSchema,
  MaterialKindSchema,
  PlanGoalSchema,
  PlanLevelSchema,
  PlanSchema,
  PlanStatusSchema,
  UserSchema,
} from "./schemas";
import { readDbOrSeed, writeDb } from "./store";

import type {
  Db,
  Material,
  MaterialKind,
  Plan,
  PlanGoal,
  PlanLevel,
  PlanSession,
  PlanSessionStatus,
  PlanSessionType,
  SessionBlueprint,
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
  planId: string;
  planTitle: string;
  moduleTitle: string;
  sessionTitle: string;
  type: PlanSessionType;
  status: PlanSessionStatus;
  scheduledDate: string;
  durationMinutes: number;
  planIcon: string;
  planColor: string;
};

export type SessionSummaryCard = {
  sessionId: string;
  planId: string;
  moduleTitle: string;
  sessionTitle: string;
  completedAt: string;
  durationMinutes: number;
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

function requirePlan(db: Db, planId: string): Plan {
  const plan = db.plans.find((p) => p.id === planId);
  if (!plan) {
    throw new Error("NOT_FOUND_PLAN");
  }
  return plan;
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

function mutateMaterialsForAnalysis(db: Db, now: Date): boolean {
  let changed = false;
  for (const doc of db.materials) {
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
        "자동 분석이 완료되었습니다. 요약 정보를 기반으로 Plan을 생성할 수 있습니다.";
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

export function listMaterials(): Array<Material> {
  const db = readDb();
  requireUser(db);

  const changed = mutateMaterialsForAnalysis(db, new Date());
  if (changed) {
    commit(db);
  }

  return db.materials
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function uploadMaterial(input: {
  kind: MaterialKind;
  title: string;
  source:
    | { type: "file"; fileName: string; fileSizeBytes?: number }
    | { type: "url"; url: string }
    | { type: "text"; text: string };
}): Material {
  const db = readDb();
  requireUser(db);

  const kind = MaterialKindSchema.parse(input.kind);
  const title = z.string().min(1).max(120).parse(input.title.trim());

  const now = nowIso();
  const analysisReadyAt = new Date();
  analysisReadyAt.setSeconds(analysisReadyAt.getSeconds() + 3);

  const base: Omit<Material, "source"> = {
    id: randomUuidV4(),
    title,
    kind,
    status: "analyzing",
    summary: undefined,
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

  const material: Material = {
    ...base,
    source,
  };

  db.materials.unshift(material);
  commit(db);
  return material;
}

export function deleteMaterial(input: { materialId: string }): void {
  const db = readDb();
  requireUser(db);
  db.materials = db.materials.filter((d) => d.id !== input.materialId);
  commit(db);
}

export function listPlans(): Array<PlanWithDerived> {
  const db = readDb();
  requireUser(db);
  return db.plans
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

  if (status === "active") {
    // 사용자의 다른 plan들을 paused로 변경 (활성 플랜은 하나만 권장)
    for (const p of db.plans) {
      if (p.id !== plan.id && p.status === "active") {
        p.status = "paused";
        p.updatedAt = nowIso();
      }
    }
  }

  commit(db);
  return withDerivedPlan(PlanSchema.parse(plan));
}

export function setActivePlan(input: { planId: string }): void {
  const db = readDb();
  requireUser(db);
  requirePlan(db, input.planId);

  for (const p of db.plans) {
    if (p.id === input.planId) {
      p.status = "active";
      p.updatedAt = nowIso();
    } else if (p.status === "active") {
      p.status = "paused";
      p.updatedAt = nowIso();
    }
  }

  commit(db);
}

export function createPlan(input: {
  title?: string;
  icon?: string;
  color?: string;
  sourceMaterialIds: Array<string>;
  goal: PlanGoal;
  level: PlanLevel;
  durationMode: "custom" | "adaptive";
  durationValue?: number;
  durationUnit?: "days" | "weeks" | "months";
  notes?: string;
}): PlanWithDerived {
  const db = readDb();
  requireUser(db);

  const sourceMaterialIds = z
    .array(z.string().uuid())
    .min(1)
    .max(5)
    .parse(input.sourceMaterialIds);
  const goal = PlanGoalSchema.parse(input.goal);
  const level = PlanLevelSchema.parse(input.level);

  const materials = db.materials.filter((d) =>
    sourceMaterialIds.includes(d.id),
  );
  if (materials.length !== sourceMaterialIds.length) {
    throw new Error("INVALID_MATERIAL_SELECTION");
  }
  if (materials.some((d) => d.status !== "completed")) {
    throw new Error("MATERIALS_NOT_READY");
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

  const module1Title = "Module 1: Foundations";
  const module2Title = "Module 2: Practice";

  const session1Id = randomPublicId();
  const session2Id = randomPublicId();

  const planTitle = input.title || materials[0]?.title || "새 학습 계획";

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
    nextSessionTitle: "Session 2: 적용 연습",
  });
  const blueprint2 = createSessionBlueprint({
    planId,
    moduleId: module2Id,
    planSessionId: session2Id,
    sessionType: "session",
    planTitle,
    moduleTitle: module2Title,
    sessionTitle: "Session 2: 적용 연습",
    targetMinutes: 30,
    level,
  });

  const plan: Plan = {
    id: planId,
    title: planTitle,
    icon: input.icon || "target",
    color: input.color || "blue",
    goal,
    level,
    status: "active",
    createdAt: now,
    updatedAt: now,
    sourceMaterialIds,
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
          },
        ],
      },
      {
        id: module2Id,
        title: module2Title,
        summary: "개념을 실제 사례에 적용하며 깊이 이해합니다.",
        sessions: [
          {
            id: session2Id,
            moduleId: module2Id,
            blueprintId: blueprint2.blueprintId,
            title: "Session 2: 적용 연습",
            type: "session",
            scheduledDate: schedule[1],
            durationMinutes: 30,
            status: "todo",
          },
        ],
      },
    ],
  };

  db.sessionBlueprints.unshift(blueprint1, blueprint2);
  db.plans.unshift(plan);

  // 다른 플랜들 비활성화
  for (const p of db.plans) {
    if (p.id !== planId && p.status === "active") {
      p.status = "paused";
      p.updatedAt = nowIso();
    }
  }

  commit(db);

  return withDerivedPlan(plan);
}

export function homeQueue(): Array<HomeQueueItem> {
  const db = readDb();
  requireUser(db);

  const today = todayIsoDate();

  const activePlans = db.plans.filter((p) => p.status === "active");

  const items: Array<HomeQueueItem> = [];
  for (const plan of activePlans) {
    for (const module of plan.modules) {
      for (const session of module.sessions) {
        if (session.status === "completed") continue;
        if (session.scheduledDate > today) continue;
        items.push({
          sessionId: session.id,
          planId: plan.id,
          planTitle: plan.title,
          moduleTitle: module.title,
          sessionTitle: session.title,
          type: session.type,
          status: session.status,
          scheduledDate: session.scheduledDate,
          durationMinutes: session.durationMinutes,
          planIcon: plan.icon,
          planColor: plan.color,
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
          moduleTitle: module.title,
          sessionTitle: session.title,
          completedAt: session.completedAt,
          durationMinutes: session.durationMinutes,
        });
      }
    }
  }

  // 데이터가 부족할 경우 테스트용 모크 데이터 생성
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

      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(
        Math.floor(Math.random() * 12) + 9,
        Math.floor(Math.random() * 60),
      );

      cards.push({
        sessionId: `mock-session-${i}`,
        planId: `mock-plan-${i}`,
        moduleTitle: topic.module,
        sessionTitle: topic.session,
        completedAt: date.toISOString(),
        durationMinutes: 15 + Math.floor(Math.random() * 45),
      });
    }
  }

  return cards
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, Math.max(0, Math.min(10, limit)));
}

export function planNextQueue(
  planId: string,
  limit: number,
): Array<HomeQueueItem> {
  const db = readDb();
  requireUser(db);
  const plan = requirePlan(db, planId);

  const today = todayIsoDate();

  const items: Array<HomeQueueItem> = [];
  for (const module of plan.modules) {
    for (const session of module.sessions) {
      if (session.status === "completed") continue;
      if (session.scheduledDate > today) continue;
      items.push({
        sessionId: session.id,
        planId: plan.id,
        planTitle: plan.title,
        moduleTitle: module.title,
        sessionTitle: session.title,
        type: session.type,
        status: session.status,
        scheduledDate: session.scheduledDate,
        durationMinutes: session.durationMinutes,
        planIcon: plan.icon,
        planColor: plan.color,
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
  id?: string;
} {
  const db = readDb();
  requireUser(db);

  const run = db.sessionRuns.find((r) => r.runId === input.runId);
  if (!run) {
    throw new Error("NOT_FOUND_RUN");
  }
  if (run.status === "COMPLETED") {
    return {};
  }

  const plan = requirePlan(db, run.planId);
  const found = findSessionInPlan(plan, run.sessionId);
  if (!found) {
    throw new Error("NOT_FOUND_SESSION");
  }

  const createdAt = nowIso();

  found.session.status = "completed";
  found.session.completedAt = createdAt;

  run.status = "COMPLETED";
  run.updatedAt = createdAt;

  commit(db);
  return {};
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
