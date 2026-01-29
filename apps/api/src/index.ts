import { serve } from "@hono/node-server";
import { createAiModels } from "@repo/ai";
import { coreError } from "@repo/core/common/core-error";
import { createAuthService as createCoreAuthService } from "@repo/core/modules/auth";
import { createKnowledgeService } from "@repo/core/modules/knowledge";
import {
  createAiMaterialAnalyzer,
  createDocumentParser,
  createMaterialProcessor,
  createMaterialRepository,
  createMaterialService,
} from "@repo/core/modules/material";
import {
  createAiPlanGeneration,
  createPlanService as createCorePlanService,
} from "@repo/core/modules/plan";
import {
  createAiSessionBlueprintGenerator,
  createSessionService as createCoreSessionService,
} from "@repo/core/modules/session";
import { ResultAsync, errAsync } from "neverthrow";

import "dotenv/config";

import { createApp } from "./app";
import {
  createMaterialProcessingWorker,
  createPlanGenerationWorker,
  initializeQueueRegistry,
} from "./infrastructure/queue";
import { CONFIG } from "./lib/config";
import { createDatabase } from "./lib/db";
import { createLogger } from "./lib/logger";
import {
  copyObject,
  createPresignedPutUrl,
  deleteObject,
  getObjectBytes,
  headObject,
} from "./lib/r2";
import { ApiError } from "./middleware/error-handler";

import type { AppError as CoreAppError } from "@repo/core/common/result";
import type {
  MaterialProcessingQueuePort,
  R2StoragePort,
} from "@repo/core/modules/material";
import type {
  MaterialReaderPort,
  PlanGenerationPort,
  PlanGenerationQueuePort,
  PlanLoggerPort,
} from "@repo/core/modules/plan";
import type { AppDeps } from "./app-deps";
import type { AppError as ApiAppError } from "./lib/result";
import type {
  AiError,
  AiModels,
  ChatModelPort,
  EmbeddingModelPort,
} from "@repo/ai";

const logger = createLogger(CONFIG);
const db = createDatabase(CONFIG);

const aiModels = createAiModelsOrUnavailable(CONFIG);
const knowledge = createKnowledgeService({
  databaseUrl: CONFIG.DATABASE_URL,
  embeddingModel: aiModels.embedding,
});

const documentParser = createDocumentParser();
const materialAnalyzer = createAiMaterialAnalyzer({ chatModel: aiModels.chat });
const sessionBlueprintGenerator = createAiSessionBlueprintGenerator({
  chatModel: aiModels.chat,
});

// 1. Queue 초기화
const queueRegistry = initializeQueueRegistry();

const materialRepository = createMaterialRepository(db);

const authService = createCoreAuthService({ db, config: CONFIG, logger });

const r2 = {
  createPresignedPutUrl,
  headObject,
  getObjectBytes,
  copyObject,
  deleteObject,
};

const materialService = createMaterialService({
  materialRepository,
  documentParser,
  materialAnalyzer,
  knowledge,
  r2: createR2StorageAdapter(r2),
  materialProcessingQueue: createMaterialProcessingQueueAdapter(
    queueRegistry.queues.materialProcessing,
  ),
});

// 2. Worker 초기화 및 실행
const materialProcessor = createMaterialProcessor({
  materialRepository,
  documentParser,
  materialAnalyzer,
  knowledge,
  r2: createR2StorageAdapter(r2),
});

const materialWorker = createMaterialProcessingWorker({
  processMaterialUpload: materialProcessor,
});

queueRegistry.registerWorker(materialWorker);

// Worker 에러 로깅
materialWorker.on("error", (err) => {
  logger.error({ err }, "Material Worker Error");
});

materialWorker.on("failed", (job, err) => {
  logger.error(
    { jobId: job?.id, uploadId: job?.data.uploadId, err },
    "Material Job Failed",
  );
});

const planGeneration = createAiPlanGeneration({
  logger: createPlanLoggerAdapter(logger),
  materialReader: createMaterialReaderAdapter(materialRepository),
  knowledge,
  chatModel: aiModels.chat,
}) satisfies PlanGenerationPort;

const planCore = createCorePlanService({
  db,
  planGeneration,
  planGenerationQueue: createPlanGenerationQueueAdapter(
    queueRegistry.queues.planGeneration,
  ),
  materialReader: createMaterialReaderAdapter(materialRepository),
});

const planWorker = createPlanGenerationWorker({
  processPlanGeneration: planCore.createPlanProcessor,
});

queueRegistry.registerWorker(planWorker);

// Plan Worker 에러 로깅
planWorker.on("error", (err) => {
  logger.error({ err }, "Plan Worker Error");
});

planWorker.on("failed", (job, err) => {
  logger.error(
    { jobId: job?.id, planId: job?.data.planId, err },
    "Plan Job Failed",
  );
});

const planService = planCore;
const sessionService = createCoreSessionService({
  db,
  knowledge,
  sessionBlueprintGenerator,
});

const deps = {
  config: CONFIG,
  logger,
  services: {
    auth: authService,
    material: materialService,
    plan: planService,
    session: sessionService,
  },
} satisfies AppDeps;

const app = createApp(deps);

const server = serve(
  {
    fetch: app.fetch,
    port: deps.config.PORT,
  },
  (info) => {
    deps.logger.info(
      {
        port: info.port,
        nodeEnv: deps.config.NODE_ENV,
        serviceName: deps.config.SERVICE_NAME,
      },
      "API server listening",
    );
  },
);

// Graceful Shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received. Shutting down...");
  await queueRegistry.shutdown();
  server.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received. Shutting down...");
  await queueRegistry.shutdown();
  server.close();
  process.exit(0);
});

function toCoreAppError(error: ApiAppError): CoreAppError {
  if (error instanceof ApiError) {
    return coreError({
      code: error.code,
      message: error.message,
      details: error.details,
      cause: error.cause,
    });
  }
  if ("_tag" in error) return error;
  return error;
}

function createMaterialReaderAdapter(
  repo: typeof materialRepository,
): MaterialReaderPort {
  return {
    findByIds: (userId, materialIds) =>
      repo.findByIds(userId, materialIds).mapErr(toCoreAppError),
    findMaterialsMetaForPlan: (materialIds) =>
      repo.findMaterialsMetaForPlan(materialIds).mapErr(toCoreAppError),
    findOutlineNodesForPlan: (materialIds) =>
      repo.findOutlineNodesForPlan(materialIds).mapErr(toCoreAppError),
  };
}

function createPlanGenerationQueueAdapter(
  queue: typeof queueRegistry.queues.planGeneration,
): PlanGenerationQueuePort {
  return {
    add: (name, data, options) =>
      ResultAsync.fromPromise(
        queue.add(name, data, options).then(() => undefined),
        (cause) =>
          coreError({
            code: "QUEUE_ADD_FAILED",
            message: "작업 큐 등록에 실패했습니다.",
            cause,
          }),
      ),
  };
}

function createPlanLoggerAdapter(loggerPort: typeof logger): PlanLoggerPort {
  return {
    info: (obj, msg) => loggerPort.info(obj, msg),
    error: (obj, msg) => loggerPort.error(obj, msg),
  };
}

function createR2StorageAdapter(r2Port: typeof r2): R2StoragePort {
  return {
    createPresignedPutUrl: (params) =>
      r2Port.createPresignedPutUrl(params).mapErr(toCoreAppError),
    headObject: (params) => r2Port.headObject(params).mapErr(toCoreAppError),
    getObjectBytes: (params) =>
      r2Port.getObjectBytes(params).mapErr(toCoreAppError),
    copyObject: (params) => r2Port.copyObject(params).mapErr(toCoreAppError),
    deleteObject: (params) =>
      r2Port.deleteObject(params).mapErr(toCoreAppError),
  };
}

function createMaterialProcessingQueueAdapter(
  queue: typeof queueRegistry.queues.materialProcessing,
): MaterialProcessingQueuePort {
  return {
    add: (name, data, options) =>
      ResultAsync.fromPromise(
        queue
          .add(name, data, options)
          .then((job) => ({ jobId: String(job.id) })),
        (cause) =>
          coreError({
            code: "QUEUE_ADD_FAILED",
            message: "작업 큐 등록에 실패했습니다.",
            cause,
          }),
      ),
  };
}

function createAiModelsOrUnavailable(config: typeof CONFIG): AiModels {
  const created = createAiModels({
    apiKey: config.AI_API_KEY ?? null,
    embeddingApiKey: config.AI_EMBEDDING_API_KEY ?? null,
    chatModel: config.GEMINI_CHAT_MODEL,
    embeddingModel: config.GEMINI_EMBEDDING_MODEL,
  });

  if (created.isOk()) return created.value;

  const error: AiError = created.error;

  const chat: ChatModelPort = {
    generateStructuredOutput: () => errAsync(error),
    generateJson: () => errAsync(error),
  };

  const embedding: EmbeddingModelPort = {
    embedDocuments: () => errAsync(error),
    embedQuery: () => errAsync(error),
    embedContent: () => errAsync(error),
  };

  logger.warn({ error }, "AI is unavailable; using fallback models");

  return { chat, embedding };
}
