import { HttpResponse, http } from "msw";
import { z } from "zod";

import type { paths } from "~/foundation/types/api";

import {
  createPlan,
  deleteMaterial,
  getPlan,
  getSessionRun,
  homeQueue,
  listMaterials,
  listPlans,
  requestMagicLink,
  setActivePlan,
  setPlanStatus,
  signInWithGoogle,
  startSession,
  uploadMaterial,
} from "~/app/mocks/api";
import { readDbOrSeed, writeDb } from "~/app/mocks/store";
import { clearAuthSession, readAuthSession } from "~/foundation/lib/auth";
import {
  readJsonFromStorage,
  writeJsonToStorage,
} from "~/foundation/lib/storage";
import { nowIso } from "~/foundation/lib/time";
import { randomUuidV4 } from "~/foundation/lib/uuid";

type ErrorResponse =
  paths["/api/plans"]["get"]["responses"]["default"]["content"]["application/json"];

type AuthMeOk =
  paths["/api/auth/me"]["get"]["responses"]["200"]["content"]["application/json"];
type AuthLogoutOk =
  paths["/api/auth/logout"]["post"]["responses"]["200"]["content"]["application/json"];
type MagicLinkOk =
  paths["/api/auth/magic-link"]["post"]["responses"]["200"]["content"]["application/json"];

type MaterialsListOk =
  paths["/api/materials"]["get"]["responses"]["200"]["content"]["application/json"];
type MaterialDetailOk =
  paths["/api/materials/{materialId}"]["get"]["responses"]["200"]["content"]["application/json"];
type MaterialUploadInitOk =
  paths["/api/materials/uploads/init"]["post"]["responses"]["200"]["content"]["application/json"];
type MaterialUploadCompleteCreated =
  paths["/api/materials/uploads/complete"]["post"]["responses"]["201"]["content"]["application/json"];
type JobStatusOk =
  paths["/api/jobs/{jobId}"]["get"]["responses"]["200"]["content"]["application/json"];
type MaterialDeleteOk =
  paths["/api/materials/{materialId}"]["delete"]["responses"]["200"]["content"]["application/json"];
type MaterialUpdateOk =
  paths["/api/materials/{materialId}"]["patch"]["responses"]["200"]["content"]["application/json"];

type PlanListOk =
  paths["/api/plans"]["get"]["responses"]["200"]["content"]["application/json"];
type PlanCreateCreated =
  paths["/api/plans"]["post"]["responses"]["201"]["content"]["application/json"];
type PlanDetailOk =
  paths["/api/plans/{planId}"]["get"]["responses"]["200"]["content"]["application/json"];
type PlanStatusUpdateOk =
  paths["/api/plans/{planId}/status"]["patch"]["responses"]["200"]["content"]["application/json"];
type PlanActivateOk =
  paths["/api/plans/{planId}/activate"]["post"]["responses"]["200"]["content"]["application/json"];
type PlanDeleteOk =
  paths["/api/plans/{planId}"]["delete"]["responses"]["200"]["content"]["application/json"];

type HomeQueueOk =
  paths["/api/home/queue"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateSessionRunCreated =
  paths["/api/sessions/{sessionId}/runs"]["post"]["responses"]["201"]["content"]["application/json"];
type SessionRunDetailOk =
  paths["/api/session-runs/{runId}"]["get"]["responses"]["200"]["content"]["application/json"];
type SessionRunProgressOk =
  paths["/api/session-runs/{runId}/progress"]["patch"]["responses"]["200"]["content"]["application/json"];
type CompleteSessionRunOk =
  paths["/api/session-runs/{runId}/complete"]["post"]["responses"]["200"]["content"]["application/json"];
type AbandonSessionRunOk =
  paths["/api/session-runs/{runId}/abandon"]["post"]["responses"]["200"]["content"]["application/json"];
type UpdatePlanSessionOk =
  paths["/api/sessions/{sessionId}"]["patch"]["responses"]["200"]["content"]["application/json"];
type ListSessionRunsOk =
  paths["/api/session-runs"]["get"]["responses"]["200"]["content"]["application/json"];
type ListSessionCheckinsOk =
  paths["/api/session-runs/{runId}/checkins"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateSessionCheckinCreated =
  paths["/api/session-runs/{runId}/checkins"]["post"]["responses"]["201"]["content"]["application/json"];
type ListSessionActivitiesOk =
  paths["/api/session-runs/{runId}/activities"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateSessionActivityCreated =
  paths["/api/session-runs/{runId}/activities"]["post"]["responses"]["201"]["content"]["application/json"];

type CreateChatThreadCreated =
  paths["/api/chat/threads"]["post"]["responses"]["201"]["content"]["application/json"];
type CreateChatMessageOk =
  paths["/api/chat/threads/{threadId}/messages"]["post"]["responses"]["200"]["content"]["application/json"];
type ListChatMessagesOk =
  paths["/api/chat/threads/{threadId}/messages"]["get"]["responses"]["200"]["content"]["application/json"];

type MagicLinkBody = NonNullable<
  paths["/api/auth/magic-link"]["post"]["requestBody"]
>["content"]["application/json"];

type MaterialUploadInitBody = NonNullable<
  paths["/api/materials/uploads/init"]["post"]["requestBody"]
>["content"]["application/json"];

type MaterialUploadCompleteBody = NonNullable<
  paths["/api/materials/uploads/complete"]["post"]["requestBody"]
>["content"]["application/json"];

type MaterialUpdateBody = NonNullable<
  paths["/api/materials/{materialId}"]["patch"]["requestBody"]
>["content"]["application/json"];

type PlanCreateBody = NonNullable<
  paths["/api/plans"]["post"]["requestBody"]
>["content"]["application/json"];

type PlanStatusBody = NonNullable<
  paths["/api/plans/{planId}/status"]["patch"]["requestBody"]
>["content"]["application/json"];

type SessionRunProgressBody = NonNullable<
  paths["/api/session-runs/{runId}/progress"]["patch"]["requestBody"]
>["content"]["application/json"];

type UpdatePlanSessionBody = NonNullable<
  paths["/api/sessions/{sessionId}"]["patch"]["requestBody"]
>["content"]["application/json"];

type AbandonRunBody = NonNullable<
  paths["/api/session-runs/{runId}/abandon"]["post"]["requestBody"]
>["content"]["application/json"];

type CreateCheckinBody = NonNullable<
  paths["/api/session-runs/{runId}/checkins"]["post"]["requestBody"]
>["content"]["application/json"];

type CreateActivityBody = NonNullable<
  paths["/api/session-runs/{runId}/activities"]["post"]["requestBody"]
>["content"]["application/json"];

type CreateChatThreadBody = NonNullable<
  paths["/api/chat/threads"]["post"]["requestBody"]
>["content"]["application/json"];

type CreateChatMessageBody = NonNullable<
  paths["/api/chat/threads/{threadId}/messages"]["post"]["requestBody"]
>["content"]["application/json"];

function errorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): ErrorResponse {
  return { error: { code, message, details } };
}

function requireAuthOr401() {
  const session = readAuthSession();
  if (!session) {
    return HttpResponse.json(
      errorResponse("UNAUTHENTICATED", "로그인이 필요합니다."),
      { status: 401 },
    );
  }
  return null;
}

function mapMaterialStatusToProcessingStatus(
  status: "pending" | "analyzing" | "completed" | "error",
): "PENDING" | "PROCESSING" | "READY" | "FAILED" {
  if (status === "pending") return "PENDING";
  if (status === "analyzing") return "PROCESSING";
  if (status === "completed") return "READY";
  return "FAILED";
}

function mapMaterialToMaterialListItem(
  material: ReturnType<typeof listMaterials>[number],
): MaterialsListOk["data"][number] {
  const sourceType = material.kind === "file" ? "FILE" : "TEXT";
  const fileSize =
    material.source?.type === "file"
      ? (material.source.fileSizeBytes ?? null)
      : null;

  return {
    id: material.id,
    title: material.title,
    sourceType,
    mimeType: null,
    fileSize,
    processingStatus: mapMaterialStatusToProcessingStatus(material.status),
    summary: material.summary ?? null,
    createdAt: material.createdAt,
    updatedAt: material.updatedAt,
  };
}

function mapPlanStatus(
  status: ReturnType<typeof getPlan>["status"],
): "ACTIVE" | "PAUSED" | "ARCHIVED" | "COMPLETED" {
  if (status === "active") return "ACTIVE";
  if (status === "paused") return "PAUSED";
  return "ARCHIVED";
}

function mapPlanGoalType(
  goal: ReturnType<typeof getPlan>["goal"],
): "JOB" | "CERT" | "WORK" | "HOBBY" | "OTHER" {
  if (goal === "career") return "JOB";
  if (goal === "certificate") return "CERT";
  if (goal === "work") return "WORK";
  if (goal === "hobby") return "HOBBY";
  return "OTHER";
}

function mapPlanLevel(
  level: ReturnType<typeof getPlan>["level"],
): "BEGINNER" | "INTERMEDIATE" | "ADVANCED" {
  if (level === "intermediate") return "INTERMEDIATE";
  if (level === "advanced") return "ADVANCED";
  return "BEGINNER";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapPlanSessionType(_type: "session"): "LEARN" {
  return "LEARN";
}

function mapPlanSessionStatus(
  status: "todo" | "in_progress" | "completed",
): "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" {
  if (status === "in_progress") return "IN_PROGRESS";
  if (status === "completed") return "COMPLETED";
  return "SCHEDULED";
}

const UploadSessionSchema = z.object({
  uploadId: z.string().uuid(),
  originalFilename: z.string().min(1),
  mimeType: z.string().min(1),
  fileSize: z.number().int().positive(),
  objectKey: z.string().min(1),
  createdAt: z.string().datetime(),
});

const UploadStoreSchema = z.object({
  items: z.array(UploadSessionSchema),
});

type UploadStore = z.infer<typeof UploadStoreSchema>;
type UploadSession = z.infer<typeof UploadSessionSchema>;

const UPLOAD_STORE_KEY = "tlm_mock_material_uploads_v1";

function readUploadStore(): UploadStore {
  return (
    readJsonFromStorage(UPLOAD_STORE_KEY, UploadStoreSchema) ?? {
      items: [],
    }
  );
}

function writeUploadStore(store: UploadStore): void {
  writeJsonToStorage(UPLOAD_STORE_KEY, UploadStoreSchema, store);
}

function takeUpload(uploadId: string): UploadSession | null {
  const store = readUploadStore();
  const idx = store.items.findIndex((i) => i.uploadId === uploadId);
  if (idx === -1) return null;
  const [item] = store.items.splice(idx, 1);
  writeUploadStore(store);
  return item ?? null;
}

const ChatStoreSchema = z.object({
  threads: z.record(
    z.string().uuid(),
    z.object({
      messages: z.array(
        z.object({
          id: z.string().uuid(),
          role: z.enum(["USER", "ASSISTANT", "SYSTEM"]),
          contentMd: z.string(),
          createdAt: z.string().datetime(),
        }),
      ),
    }),
  ),
});
type ChatStore = z.infer<typeof ChatStoreSchema>;
const CHAT_STORE_KEY = "tlm_mock_chat_v1";

function readChatStore(): ChatStore {
  return (
    readJsonFromStorage(CHAT_STORE_KEY, ChatStoreSchema) ?? {
      threads: {},
    }
  );
}

function writeChatStore(store: ChatStore): void {
  writeJsonToStorage(CHAT_STORE_KEY, ChatStoreSchema, store);
}

function parsePagination(url: URL): { page: number; limit: number } {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const limit = Math.max(
    1,
    Math.min(100, Number(url.searchParams.get("limit") ?? "20") || 20),
  );
  return { page, limit };
}

export const handlers = [
  // Auth
  http.get("/api/auth/me", () => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const session = readAuthSession();
    const db = readDbOrSeed();
    const user = db.user;
    if (!session || !user || user.id !== session.userId) {
      return HttpResponse.json(
        errorResponse("UNAUTHENTICATED", "로그인이 필요합니다."),
        { status: 401 },
      );
    }

    const response: AuthMeOk = {
      data: {
        id: user.id,
        email: user.email,
        displayName: user.name,
        avatarUrl: null,
        locale: "ko-KR",
        timezone: "Asia/Seoul",
        subscriptionPlan: "FREE",
      },
    };
    return HttpResponse.json(response);
  }),

  http.post("/api/auth/logout", () => {
    clearAuthSession();
    const response: AuthLogoutOk = { message: "Logged out" };
    return HttpResponse.json(response);
  }),

  http.post("/api/auth/magic-link", async ({ request }) => {
    const body = (await request
      .json()
      .catch(() => null)) as MagicLinkBody | null;
    if (!body) {
      return HttpResponse.json(
        errorResponse("BAD_REQUEST", "Invalid JSON body"),
        { status: 400 },
      );
    }

    requestMagicLink(body.email);
    const response: MagicLinkOk = { message: "Magic link requested" };
    return HttpResponse.json(response);
  }),

  http.get("/api/auth/google/callback", () => {
    const user = signInWithGoogle();
    const response: AuthMeOk = {
      data: {
        id: user.id,
        email: user.email,
        displayName: user.name,
        avatarUrl: null,
        locale: "ko-KR",
        timezone: "Asia/Seoul",
        subscriptionPlan: "FREE",
      },
    };
    return HttpResponse.json(response, { status: 200 });
  }),

  http.get("/api/auth/google", () => {
    signInWithGoogle();
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // Materials
  http.get("/api/materials", ({ request }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const { page, limit } = parsePagination(url);
    const status = url.searchParams.get("status");
    const search = (url.searchParams.get("search") ?? "").trim().toLowerCase();

    const mapped = listMaterials()
      .map(mapMaterialToMaterialListItem)
      .filter((m) => (status ? m.processingStatus === status : true))
      .filter((m) => {
        if (!search) return true;
        const hay = `${m.title} ${m.summary ?? ""}`.toLowerCase();
        return hay.includes(search);
      });

    const total = mapped.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = mapped.slice(start, start + limit);

    const response: MaterialsListOk = {
      data,
      meta: { total, page, limit, totalPages },
    };
    return HttpResponse.json(response);
  }),

  http.get("/api/materials/:materialId", ({ params }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const materialId = String(params.materialId ?? "");
    const db = readDbOrSeed();
    const doc = db.materials.find((d) => d.id === materialId);
    if (!doc) {
      return HttpResponse.json(
        errorResponse("NOT_FOUND", "Material not found"),
        {
          status: 404,
        },
      );
    }

    const sourceType = doc.kind === "file" ? "FILE" : "TEXT";
    const originalFilename =
      doc.source?.type === "file" ? doc.source.fileName : null;
    const fileSize =
      doc.source?.type === "file" ? (doc.source.fileSizeBytes ?? null) : null;

    const response: MaterialDetailOk = {
      data: {
        id: doc.id,
        title: doc.title,
        sourceType,
        originalFilename,
        mimeType: null,
        fileSize,
        processingStatus: mapMaterialStatusToProcessingStatus(doc.status),
        processedAt: doc.status === "completed" ? doc.updatedAt : null,
        summary: doc.summary ?? null,
        chunkCount: null,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    };
    return HttpResponse.json(response);
  }),

  http.post("/api/materials/uploads/init", async ({ request }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const body = (await request
      .json()
      .catch(() => null)) as MaterialUploadInitBody | null;
    if (!body) {
      return HttpResponse.json(
        errorResponse("BAD_REQUEST", "Invalid JSON body"),
        { status: 400 },
      );
    }

    const uploadId = randomUuidV4();
    const objectKey = `mock/${uploadId}/${body.originalFilename}`;

    const store = readUploadStore();
    store.items.unshift({
      uploadId,
      originalFilename: body.originalFilename,
      mimeType: body.mimeType,
      fileSize: body.fileSize,
      objectKey,
      createdAt: nowIso(),
    });
    writeUploadStore(store);

    const response: MaterialUploadInitOk = {
      data: {
        uploadId,
        objectKey,
        uploadUrl: `https://example.invalid/mock-upload/${encodeURIComponent(objectKey)}`,
        method: "PUT",
        headers: {},
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      },
    };
    return HttpResponse.json(response);
  }),

  // Presigned upload URL (MSW 전용)
  http.put(/^https:\/\/example\.invalid\/mock-upload\/.+$/, async () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        ETag: '"mock-etag"',
      },
    });
  }),

  http.post("/api/materials/uploads/complete", async ({ request }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const body = (await request
      .json()
      .catch(() => null)) as MaterialUploadCompleteBody | null;
    if (!body) {
      return HttpResponse.json(
        errorResponse("BAD_REQUEST", "Invalid JSON body"),
        { status: 400 },
      );
    }

    const upload = takeUpload(body.uploadId);
    if (!upload) {
      return HttpResponse.json(errorResponse("NOT_FOUND", "Upload not found"), {
        status: 404,
      });
    }

    const created = uploadMaterial({
      kind: "file",
      title: body.title ?? upload.originalFilename,
      source: {
        type: "file",
        fileName: upload.originalFilename,
        fileSizeBytes: upload.fileSize,
      },
    });

    const response: MaterialUploadCompleteCreated = {
      data: {
        id: created.id,
        title: created.title,
        processingStatus: mapMaterialStatusToProcessingStatus(created.status),
        summary: created.summary ?? null,
      },
    };
    return HttpResponse.json(response, { status: 201 });
  }),

  http.get("/api/jobs/:jobId", ({ params }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const jobId = String(params.jobId ?? "");
    const response: JobStatusOk = {
      data: {
        jobId,
        status: "SUCCEEDED",
        progress: 1,
        currentStep: "done",
        result: null,
        error: null,
      },
    };
    return HttpResponse.json(response);
  }),

  http.delete("/api/materials/:materialId", ({ params }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const materialId = String(params.materialId ?? "");
    const db = readDbOrSeed();
    const doc = db.materials.find((d) => d.id === materialId);
    if (!doc) {
      return HttpResponse.json(
        errorResponse("NOT_FOUND", "Material not found"),
        {
          status: 404,
        },
      );
    }

    deleteMaterial({ materialId: materialId });
    const response: MaterialDeleteOk = {
      message: "Deleted",
      data: { type: "soft" },
    };
    return HttpResponse.json(response);
  }),

  http.patch("/api/materials/:materialId", async ({ params, request }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const materialId = String(params.materialId ?? "");
    const body = (await request
      .json()
      .catch(() => null)) as MaterialUpdateBody | null;
    if (!body) {
      return HttpResponse.json(
        errorResponse("BAD_REQUEST", "Invalid JSON body"),
        { status: 400 },
      );
    }

    const db = readDbOrSeed();
    const doc = db.materials.find((d) => d.id === materialId);
    if (!doc) {
      return HttpResponse.json(
        errorResponse("NOT_FOUND", "Material not found"),
        {
          status: 404,
        },
      );
    }

    doc.title = body.title;
    doc.updatedAt = nowIso();
    writeDb(db);

    const response: MaterialUpdateOk = {
      data: { id: doc.id, title: doc.title, updatedAt: doc.updatedAt },
    };
    return HttpResponse.json(response);
  }),

  // Plans
  http.get("/api/plans", ({ request }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const { page, limit } = parsePagination(url);
    const status = url.searchParams.get("status");

    const all = listPlans();
    const filtered = all.filter((p) =>
      status ? mapPlanStatus(p.status) === status : true,
    );

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit).map((p) => {
      const totalSessions = p.modules.reduce(
        (acc, m) => acc + m.sessions.length,
        0,
      );
      const completedSessions = p.modules.reduce(
        (acc, m) =>
          acc + m.sessions.filter((s) => s.status === "completed").length,
        0,
      );

      return {
        id: p.id,
        title: p.title,
        icon: p.icon,
        color: p.color,
        status: mapPlanStatus(p.status),
        goalType: mapPlanGoalType(p.goal),
        currentLevel: mapPlanLevel(p.level),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        progress: { completedSessions, totalSessions },
        sourceMaterialIds: p.sourceMaterialIds,
      } satisfies PlanListOk["data"][number];
    });

    const response: PlanListOk = {
      data,
      meta: { total, page, limit },
    };
    return HttpResponse.json(response);
  }),

  http.get("/api/plans/:planId", ({ params }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const planId = String(params.planId ?? "");
    let plan: ReturnType<typeof getPlan>;
    try {
      plan = getPlan(planId);
    } catch {
      return HttpResponse.json(errorResponse("NOT_FOUND", "Plan not found"), {
        status: 404,
      });
    }

    const totalSessions = plan.modules.reduce(
      (acc, m) => acc + m.sessions.length,
      0,
    );
    const completedSessions = plan.modules.reduce(
      (acc, m) =>
        acc + m.sessions.filter((s) => s.status === "completed").length,
      0,
    );

    const response: PlanDetailOk = {
      data: {
        id: plan.id,
        title: plan.title,
        icon: plan.icon,
        color: plan.color,
        status: mapPlanStatus(plan.status),
        goalType: mapPlanGoalType(plan.goal),
        currentLevel: mapPlanLevel(plan.level),
        targetDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
        specialRequirements: null,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
        progress: { completedSessions, totalSessions },
        sourceMaterialIds: plan.sourceMaterialIds,
        modules: plan.modules.map((m, orderIndex) => ({
          id: m.id,
          title: m.title,
          description: m.summary ?? null,
          orderIndex,
        })),
        sessions: plan.modules.flatMap((m, moduleIndex) =>
          m.sessions.map((s, sessionIndex) => ({
            id: s.id,
            moduleId: m.id,
            sessionType: mapPlanSessionType(s.type),
            title: s.title,
            objective: null,
            orderIndex: moduleIndex * 100 + sessionIndex,
            scheduledForDate: s.scheduledDate,
            estimatedMinutes: s.durationMinutes,
            status: mapPlanSessionStatus(s.status),
            completedAt: s.status === "completed" ? plan.updatedAt : null,
          })),
        ),
      },
    };
    return HttpResponse.json(response);
  }),

  http.post("/api/plans", async ({ request }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const body = (await request
      .json()
      .catch(() => null)) as PlanCreateBody | null;
    if (!body) {
      return HttpResponse.json(
        errorResponse("BAD_REQUEST", "Invalid JSON body"),
        { status: 400 },
      );
    }

    try {
      const plan = createPlan({
        sourceMaterialIds: body.materialIds,
        goal: (() => {
          if (body.goalType === "JOB") return "career";
          if (body.goalType === "CERT") return "certificate";
          if (body.goalType === "WORK") return "work";
          if (body.goalType === "HOBBY") return "hobby";
          return "work";
        })(),
        level: (() => {
          if (body.currentLevel === "INTERMEDIATE") return "intermediate";
          if (body.currentLevel === "ADVANCED") return "advanced";
          return "basic";
        })(),
        durationMode: "adaptive",
        notes: body.specialRequirements ?? undefined,
      });

      const response: PlanCreateCreated = {
        data: {
          id: plan.id,
          title: plan.title,
          icon: plan.icon,
          color: plan.color,
          status: mapPlanStatus(plan.status),
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        },
      };
      return HttpResponse.json(response, { status: 201 });
    } catch (err) {
      return HttpResponse.json(
        errorResponse("BAD_REQUEST", "Failed to create plan", {
          message: err instanceof Error ? err.message : String(err),
        }),
        { status: 400 },
      );
    }
  }),

  http.patch("/api/plans/:planId/status", async ({ params, request }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const planId = String(params.planId ?? "");
    const body = (await request
      .json()
      .catch(() => null)) as PlanStatusBody | null;
    if (!body) {
      return HttpResponse.json(
        errorResponse("BAD_REQUEST", "Invalid JSON body"),
        { status: 400 },
      );
    }

    const status =
      body.status === "PAUSED"
        ? "paused"
        : body.status === "ARCHIVED" || body.status === "COMPLETED"
          ? "archived"
          : "active";

    try {
      const updated = setPlanStatus({ planId, status });
      const response: PlanStatusUpdateOk = {
        data: { id: updated.id, status: mapPlanStatus(updated.status) },
      };
      return HttpResponse.json(response);
    } catch {
      return HttpResponse.json(errorResponse("NOT_FOUND", "Plan not found"), {
        status: 404,
      });
    }
  }),

  http.post("/api/plans/:planId/activate", ({ params }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const planId = String(params.planId ?? "");
    const db = readDbOrSeed();
    const plan = db.plans.find((p) => p.id === planId);
    if (!plan) {
      return HttpResponse.json(errorResponse("NOT_FOUND", "Plan not found"), {
        status: 404,
      });
    }

    setActivePlan({ planId });
    const updated = getPlan(planId);
    const response: PlanActivateOk = {
      data: { id: updated.id, status: mapPlanStatus(updated.status) },
    };
    return HttpResponse.json(response);
  }),

  http.delete("/api/plans/:planId", ({ params }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const planId = String(params.planId ?? "");
    const db = readDbOrSeed();
    const plan = db.plans.find((p) => p.id === planId);
    if (!plan) {
      return HttpResponse.json(errorResponse("NOT_FOUND", "Plan not found"), {
        status: 404,
      });
    }

    db.plans = db.plans.filter((p) => p.id !== planId);
    writeDb(db);

    const response: PlanDeleteOk = { message: "Deleted" };
    return HttpResponse.json(response);
  }),

  // Sessions
  http.get("/api/home/queue", () => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const items = homeQueue().map((i) => ({
      kind: "SESSION" as const,
      sessionId: i.sessionId,
      planId: i.planId,
      planTitle: i.planTitle,
      moduleTitle: i.moduleTitle,
      sessionTitle: i.sessionTitle,
      sessionType: mapPlanSessionType(i.type),
      estimatedMinutes: i.durationMinutes,
      status: mapPlanSessionStatus(i.status),
      planIcon: i.planIcon,
      planColor: i.planColor,
    }));

    const completedCount = items.filter(
      (it) => it.status === "COMPLETED",
    ).length;
    const remainingCount = Math.max(0, items.length - completedCount);
    const estimatedMinutes = items
      .filter((it) => it.status !== "COMPLETED")
      .reduce((acc, it) => acc + it.estimatedMinutes, 0);

    const coachingMessage =
      remainingCount === 0
        ? "오늘 할 일을 모두 끝냈어요. 잘했어요!"
        : remainingCount <= 2
          ? "조금만 더 하면 오늘 목표를 달성할 수 있어요."
          : "오늘 할 일부터 차근차근 진행해보세요.";

    const response: HomeQueueOk = {
      data: items,
      summary: {
        total: items.length,
        completed: completedCount,
        estimatedMinutes,
        coachingMessage,
        streakDays: 3, // Mock streak
      },
    };
    return HttpResponse.json(response);
  }),

  http.post("/api/sessions/:sessionId/runs", ({ params }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const sessionId = String(params.sessionId ?? "");
    const db = readDbOrSeed();
    const found = db.plans
      .flatMap((p) =>
        p.modules.flatMap((m) => m.sessions.map((s) => ({ p, s }))),
      )
      .find((x) => x.s.id === sessionId);
    if (!found) {
      return HttpResponse.json(
        errorResponse("NOT_FOUND", "Session not found"),
        {
          status: 404,
        },
      );
    }

    const { runId } = startSession({ planId: found.p.id, sessionId });
    const run = getSessionRun(runId);
    const currentStep = Math.max(
      0,
      run.blueprint.steps.findIndex((s) => s.id === run.currentStepId),
    );

    const response: CreateSessionRunCreated = {
      data: {
        runId,
        sessionId,
        status: "RUNNING",
        isRecovery: Boolean(run.isRecovery),
        currentStep,
      },
    };
    return HttpResponse.json(response, { status: 201 });
  }),

  http.get("/api/session-runs/:runId", ({ params }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const runId = String(params.runId ?? "");
    let run: ReturnType<typeof getSessionRun>;
    try {
      run = getSessionRun(runId);
    } catch {
      return HttpResponse.json(errorResponse("NOT_FOUND", "Run not found"), {
        status: 404,
      });
    }

    const db = readDbOrSeed();
    const plan = db.plans.find((p) => p.id === run.planId);
    if (!plan) {
      return HttpResponse.json(errorResponse("NOT_FOUND", "Plan not found"), {
        status: 404,
      });
    }

    const found = plan.modules
      .flatMap((m) => m.sessions.map((s) => ({ module: m, session: s })))
      .find((x) => x.session.id === run.sessionId);

    const toApiStep = (
      step: Record<string, unknown>,
    ): SessionRunDetailOk["data"]["blueprint"]["steps"][number] => {
      const intent: SessionRunDetailOk["data"]["blueprint"]["steps"][number]["intent"] =
        (() => {
          const value = step.intent;
          if (value === "INTRO") return "INTRO";
          if (value === "EXPLAIN") return "EXPLAIN";
          if (value === "RETRIEVAL") return "RETRIEVAL";
          if (value === "PRACTICE") return "PRACTICE";
          if (value === "WRAPUP") return "WRAPUP";
          return undefined;
        })();

      const common = {
        id: String(step.id ?? ""),
        estimatedSeconds:
          typeof step.estimatedSeconds === "number"
            ? step.estimatedSeconds
            : undefined,
        intent,
      };

      const type = String(step.type ?? "");
      if (type === "SESSION_INTRO") {
        return {
          ...common,
          type: "SESSION_INTRO",
          planTitle: String(step.planTitle ?? ""),
          moduleTitle: String(step.moduleTitle ?? ""),
          sessionTitle: String(step.sessionTitle ?? ""),
          durationMinutes: Number(step.durationMinutes ?? 0),
          difficulty: String(step.difficulty ?? "beginner") as
            | "beginner"
            | "intermediate"
            | "advanced",
          learningGoals: Array.isArray(step.learningGoals)
            ? step.learningGoals.map(String)
            : [],
          questionsToCover: Array.isArray(step.questionsToCover)
            ? step.questionsToCover.map(String)
            : [],
          prerequisites: Array.isArray(step.prerequisites)
            ? step.prerequisites.map(String)
            : [],
        };
      }

      if (type === "CHECK") {
        return {
          ...common,
          type: "CHECK",
          question: String(step.question ?? ""),
          options: Array.isArray(step.options) ? step.options.map(String) : [],
          answerIndex: Number(step.answerIndex ?? 0),
          explanation:
            typeof step.explanation === "string" ? step.explanation : undefined,
        };
      }

      if (type === "CLOZE") {
        return {
          ...common,
          type: "CLOZE",
          sentence: String(step.sentence ?? ""),
          blankId: String(step.blankId ?? ""),
          options: Array.isArray(step.options) ? step.options.map(String) : [],
          answerIndex: Number(step.answerIndex ?? 0),
          explanation:
            typeof step.explanation === "string" ? step.explanation : undefined,
        };
      }

      if (type === "MATCHING") {
        return {
          ...common,
          type: "MATCHING",
          instruction: String(step.instruction ?? ""),
          pairs: Array.isArray(step.pairs)
            ? step.pairs
                .filter((p) => p && typeof p === "object")
                .map((p) => p as Record<string, unknown>)
                .map((p) => ({
                  id: String(p.id ?? ""),
                  left: String(p.left ?? ""),
                  right: String(p.right ?? ""),
                }))
            : [],
        };
      }

      if (type === "FLASHCARD") {
        return {
          ...common,
          type: "FLASHCARD",
          front: String(step.front ?? ""),
          back: String(step.back ?? ""),
        };
      }

      if (type === "SPEED_OX") {
        return {
          ...common,
          type: "SPEED_OX",
          statement: String(step.statement ?? ""),
          isTrue: Boolean(step.isTrue),
          explanation:
            typeof step.explanation === "string" ? step.explanation : undefined,
        };
      }

      if (type === "APPLICATION") {
        return {
          ...common,
          type: "APPLICATION",
          scenario: String(step.scenario ?? ""),
          question: String(step.question ?? ""),
          options: Array.isArray(step.options) ? step.options.map(String) : [],
          correctIndex: Number(step.correctIndex ?? 0),
          feedback:
            typeof step.feedback === "string" ? step.feedback : undefined,
        };
      }

      return {
        ...common,
        type: "SESSION_SUMMARY",
        celebrationEmoji:
          typeof step.celebrationEmoji === "string"
            ? step.celebrationEmoji
            : "🎉",
        encouragement: String(step.encouragement ?? ""),
        studyTimeMinutes:
          typeof step.studyTimeMinutes === "number"
            ? step.studyTimeMinutes
            : undefined,
        completedActivities: Array.isArray(step.completedActivities)
          ? step.completedActivities.map(String)
          : [],
        keyTakeaways: Array.isArray(step.keyTakeaways)
          ? step.keyTakeaways.map(String)
          : [],
        nextSessionPreview:
          step.nextSessionPreview && typeof step.nextSessionPreview === "object"
            ? {
                title: String(
                  (step.nextSessionPreview as Record<string, unknown>).title ??
                    "",
                ),
                description: (() => {
                  const raw = (
                    step.nextSessionPreview as Record<string, unknown>
                  ).description;
                  return typeof raw === "string" ? raw : undefined;
                })(),
              }
            : undefined,
      };
    };

    const steps = run.blueprint.steps
      .filter((s) => s && typeof s === "object")
      .map((s) => toApiStep(s as unknown as Record<string, unknown>));

    const currentStepIndex = Math.max(
      0,
      run.blueprint.steps.findIndex((s) => s.id === run.currentStepId),
    );
    const startStepIndex = Math.max(
      0,
      run.blueprint.steps.findIndex((s) => s.id === run.blueprint.startStepId),
    );

    const response: SessionRunDetailOk = {
      data: {
        runId: run.runId,
        status: run.status === "COMPLETED" ? "COMPLETED" : "RUNNING",
        startedAt: run.createdAt,
        endedAt: run.status === "COMPLETED" ? run.updatedAt : null,
        exitReason: null,
        session: {
          sessionId: run.sessionId,
          title: run.sessionTitle,
          objective: null,
          sessionType: found ? mapPlanSessionType(found.session.type) : "LEARN",
          estimatedMinutes: found?.session.durationMinutes ?? 15,
          module: found
            ? { id: found.module.id, title: found.module.title }
            : null,
          plan: {
            id: plan.id,
            title: plan.title,
            icon: plan.icon,
            color: plan.color,
          },
        },
        blueprint: {
          schemaVersion: run.blueprint.schemaVersion,
          blueprintId: run.blueprintId,
          createdAt: run.blueprint.createdAt,
          steps,
          startStepIndex,
        },
        progress: {
          stepIndex: currentStepIndex,
          inputs: run.inputs,
          savedAt: run.updatedAt ?? null,
        },
        summary: null,
      },
    };

    return HttpResponse.json(response);
  }),

  http.patch(
    "/api/session-runs/:runId/progress",
    async ({ params, request }) => {
      const unauthorized = requireAuthOr401();
      if (unauthorized) return unauthorized;

      const runId = String(params.runId ?? "");
      const body = (await request
        .json()
        .catch(() => null)) as SessionRunProgressBody | null;
      if (!body) {
        return HttpResponse.json(
          errorResponse("BAD_REQUEST", "Invalid JSON body"),
          { status: 400 },
        );
      }

      const db = readDbOrSeed();
      const run = db.sessionRuns.find((r) => r.runId === runId);
      if (!run) {
        return HttpResponse.json(errorResponse("NOT_FOUND", "Run not found"), {
          status: 404,
        });
      }

      const blueprint = db.sessionBlueprints.find(
        (b) => b.blueprintId === run.blueprintId,
      );
      if (!blueprint) {
        return HttpResponse.json(
          errorResponse("NOT_FOUND", "Blueprint not found"),
          {
            status: 404,
          },
        );
      }

      const step = blueprint.steps[body.stepIndex];
      if (step) {
        run.currentStepId = step.id;
      }
      run.inputs = body.inputs;
      run.updatedAt = nowIso();
      writeDb(db);

      const response: SessionRunProgressOk = {
        data: { runId, savedAt: run.updatedAt },
      };
      return HttpResponse.json(response);
    },
  ),

  http.patch("/api/sessions/:sessionId", async ({ params, request }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const sessionId = String(params.sessionId ?? "");
    const body = (await request
      .json()
      .catch(() => null)) as UpdatePlanSessionBody | null;
    if (!body) {
      return HttpResponse.json(
        errorResponse("BAD_REQUEST", "Invalid JSON body"),
        { status: 400 },
      );
    }

    const db = readDbOrSeed();
    const plan = db.plans.find((p) =>
      p.modules.some((m) => m.sessions.some((s) => s.id === sessionId)),
    );
    if (!plan) {
      return HttpResponse.json(
        errorResponse("NOT_FOUND", "Session not found"),
        {
          status: 404,
        },
      );
    }

    const session = plan.modules
      .flatMap((m) => m.sessions)
      .find((s) => s.id === sessionId);
    if (!session) {
      return HttpResponse.json(
        errorResponse("NOT_FOUND", "Session not found"),
        {
          status: 404,
        },
      );
    }

    if (body.scheduledForDate) {
      session.scheduledDate = body.scheduledForDate;
    }

    if (body.status) {
      session.status =
        body.status === "IN_PROGRESS"
          ? "in_progress"
          : body.status === "COMPLETED"
            ? "completed"
            : "todo";
    }

    plan.updatedAt = nowIso();
    writeDb(db);

    const response: UpdatePlanSessionOk = {
      data: {
        sessionId,
        status: mapPlanSessionStatus(session.status),
        scheduledForDate: session.scheduledDate,
      },
    };
    return HttpResponse.json(response);
  }),

  http.get("/api/session-runs", ({ request }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const url = new URL(request.url);
    const { page, limit } = parsePagination(url);
    const statusFilter = url.searchParams.get("status");

    const db = readDbOrSeed();
    const all = db.sessionRuns
      .filter((r) => (statusFilter ? String(r.status) === statusFilter : true))
      .slice();

    const total = all.length;
    const start = (page - 1) * limit;
    const slice = all.slice(start, start + limit);

    const data: ListSessionRunsOk["data"] = slice.map((r) => {
      const plan = db.plans.find((p) => p.id === r.planId);
      const found = plan
        ? plan.modules
            .flatMap((m) => m.sessions.map((s) => ({ module: m, session: s })))
            .find((x) => x.session.id === r.sessionId)
        : undefined;

      return {
        runId: r.runId,
        status: r.status === "COMPLETED" ? "COMPLETED" : "RUNNING",
        startedAt: r.createdAt,
        endedAt: r.status === "COMPLETED" ? r.updatedAt : null,
        exitReason: null,
        durationMinutes:
          r.status === "COMPLETED" && r.updatedAt
            ? Math.max(
                0,
                Math.round(
                  (new Date(r.updatedAt).getTime() -
                    new Date(r.createdAt).getTime()) /
                    60000,
                ),
              )
            : 0,
        sessionId: r.sessionId,
        sessionTitle: found?.session.title ?? "",
        sessionType: found ? mapPlanSessionType(found.session.type) : "LEARN",
        planId: r.planId,
        planTitle: plan?.title ?? "",
        planIcon: plan?.icon ?? "target",
        planColor: plan?.color ?? "blue",
        summary: null,
      };
    });

    const response: ListSessionRunsOk = {
      data,
      meta: { total, page, limit },
    };
    return HttpResponse.json(response);
  }),

  http.post("/api/session-runs/:runId/complete", ({ params }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const runId = String(params.runId ?? "");
    const db = readDbOrSeed();
    const run = db.sessionRuns.find((r) => r.runId === runId);
    if (!run) {
      return HttpResponse.json(errorResponse("NOT_FOUND", "Run not found"), {
        status: 404,
      });
    }

    run.status = "COMPLETED";
    run.updatedAt = nowIso();
    writeDb(db);

    const response: CompleteSessionRunOk = {
      data: {
        runId,
        status: "COMPLETED",
        summary: null,
      },
    };
    return HttpResponse.json(response);
  }),

  http.post("/api/session-runs/:runId/abandon", async ({ params, request }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const runId = String(params.runId ?? "");
    const body = (await request
      .json()
      .catch(() => null)) as AbandonRunBody | null;
    if (!body) {
      return HttpResponse.json(
        errorResponse("BAD_REQUEST", "Invalid JSON body"),
        { status: 400 },
      );
    }

    const db = readDbOrSeed();
    const run = db.sessionRuns.find((r) => r.runId === runId);
    if (!run) {
      return HttpResponse.json(errorResponse("NOT_FOUND", "Run not found"), {
        status: 404,
      });
    }

    void body;
    run.status = "COMPLETED";
    run.updatedAt = nowIso();
    writeDb(db);

    const response: AbandonSessionRunOk = {
      data: { runId, status: "ABANDONED" },
    };
    return HttpResponse.json(response);
  }),

  http.get("/api/session-runs/:runId/checkins", ({ params }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const runId = String(params.runId ?? "");
    const db = readDbOrSeed();
    const exists = db.sessionRuns.some((r) => r.runId === runId);
    if (!exists) {
      return HttpResponse.json(errorResponse("NOT_FOUND", "Run not found"), {
        status: 404,
      });
    }

    const response: ListSessionCheckinsOk = { data: [] };
    return HttpResponse.json(response);
  }),

  http.post(
    "/api/session-runs/:runId/checkins",
    async ({ params, request }) => {
      const unauthorized = requireAuthOr401();
      if (unauthorized) return unauthorized;

      const runId = String(params.runId ?? "");
      const body = (await request
        .json()
        .catch(() => null)) as CreateCheckinBody | null;
      if (!body) {
        return HttpResponse.json(
          errorResponse("BAD_REQUEST", "Invalid JSON body"),
          { status: 400 },
        );
      }

      void body;
      const db = readDbOrSeed();
      const exists = db.sessionRuns.some((r) => r.runId === runId);
      if (!exists) {
        return HttpResponse.json(errorResponse("NOT_FOUND", "Run not found"), {
          status: 404,
        });
      }

      const response: CreateSessionCheckinCreated = {
        data: { id: randomUuidV4(), recordedAt: nowIso() },
      };
      return HttpResponse.json(response, { status: 201 });
    },
  ),

  http.get("/api/session-runs/:runId/activities", ({ params }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const runId = String(params.runId ?? "");
    const db = readDbOrSeed();
    const exists = db.sessionRuns.some((r) => r.runId === runId);
    if (!exists) {
      return HttpResponse.json(errorResponse("NOT_FOUND", "Run not found"), {
        status: 404,
      });
    }

    const response: ListSessionActivitiesOk = { data: [] };
    return HttpResponse.json(response);
  }),

  http.post(
    "/api/session-runs/:runId/activities",
    async ({ params, request }) => {
      const unauthorized = requireAuthOr401();
      if (unauthorized) return unauthorized;

      const runId = String(params.runId ?? "");
      const body = (await request
        .json()
        .catch(() => null)) as CreateActivityBody | null;
      if (!body) {
        return HttpResponse.json(
          errorResponse("BAD_REQUEST", "Invalid JSON body"),
          { status: 400 },
        );
      }

      void body;
      const db = readDbOrSeed();
      const exists = db.sessionRuns.some((r) => r.runId === runId);
      if (!exists) {
        return HttpResponse.json(errorResponse("NOT_FOUND", "Run not found"), {
          status: 404,
        });
      }

      const response: CreateSessionActivityCreated = {
        data: { id: randomUuidV4(), createdAt: nowIso() },
      };
      return HttpResponse.json(response, { status: 201 });
    },
  ),

  // Chat
  http.post("/api/chat/threads", async ({ request }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const body = (await request
      .json()
      .catch(() => null)) as CreateChatThreadBody | null;
    if (!body) {
      return HttpResponse.json(
        errorResponse("BAD_REQUEST", "Invalid JSON body"),
        { status: 400 },
      );
    }

    void body;
    const threadId = randomUuidV4();
    const store = readChatStore();
    store.threads[threadId] = { messages: [] };
    writeChatStore(store);

    const response: CreateChatThreadCreated = { data: { threadId } };
    return HttpResponse.json(response, { status: 201 });
  }),

  http.post(
    "/api/chat/threads/:threadId/messages",
    async ({ params, request }) => {
      const unauthorized = requireAuthOr401();
      if (unauthorized) return unauthorized;

      const threadId = String(params.threadId ?? "");
      const body = (await request
        .json()
        .catch(() => null)) as CreateChatMessageBody | null;
      if (!body) {
        return HttpResponse.json(
          errorResponse("BAD_REQUEST", "Invalid JSON body"),
          { status: 400 },
        );
      }

      const store = readChatStore();
      const thread = store.threads[threadId];
      if (!thread) {
        return HttpResponse.json(
          errorResponse("NOT_FOUND", "Thread not found"),
          {
            status: 404,
          },
        );
      }

      thread.messages.push({
        id: randomUuidV4(),
        role: "USER",
        contentMd: body.content,
        createdAt: nowIso(),
      });

      const assistantId = randomUuidV4();
      const assistantText = `Mock reply: ${body.content.slice(0, 200)}`;
      thread.messages.push({
        id: assistantId,
        role: "ASSISTANT",
        contentMd: assistantText,
        createdAt: nowIso(),
      });
      writeChatStore(store);

      const response: CreateChatMessageOk = {
        data: {
          id: assistantId,
          role: "ASSISTANT",
          contentMd: assistantText,
          citations: [],
        },
      };
      return HttpResponse.json(response);
    },
  ),

  http.get("/api/chat/threads/:threadId/messages", ({ params }) => {
    const unauthorized = requireAuthOr401();
    if (unauthorized) return unauthorized;

    const threadId = String(params.threadId ?? "");
    const store = readChatStore();
    const thread = store.threads[threadId];
    if (!thread) {
      return HttpResponse.json(errorResponse("NOT_FOUND", "Thread not found"), {
        status: 404,
      });
    }

    const response: ListChatMessagesOk = {
      data: thread.messages.map((m) => ({
        id: m.id,
        role: m.role,
        contentMd: m.contentMd,
        citations: [],
      })),
    };
    return HttpResponse.json(response);
  }),
] as const;
