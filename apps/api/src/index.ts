import { serve } from "@hono/node-server";
import { createAiModels } from "@repo/ai";
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
import {
  createMaterialReaderPort,
  createPlanLoggerPort,
} from "@repo/core-adapters";
import {
  createMaterialProcessingQueuePort,
  createMaterialProcessingWorker,
  createPlanGenerationQueuePort,
  createPlanGenerationWorker,
  createQueueRegistry,
  defaultJobOptions,
  getConnectionOptions,
} from "@repo/queue-bullmq";
import { createR2StoragePortFromConfig } from "@repo/storage-r2";
import { errAsync } from "neverthrow";

import "dotenv/config";

import { createApp } from "./app";
import { CONFIG } from "./lib/config";
import { createDatabase } from "./lib/db";
import { createLogger } from "./lib/logger";

import type { AppDeps } from "./app-deps";
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

const connection = getConnectionOptions({ redisUrl: CONFIG.REDIS_URL });
const queueRegistry = createQueueRegistry({
  connection,
  defaultJobOptions,
});

const materialRepository = createMaterialRepository(db);

const authService = createCoreAuthService({ db, config: CONFIG, logger });

const r2 = createR2StoragePortFromConfig({
  endpoint: CONFIG.R2_ENDPOINT,
  accessKeyId: CONFIG.R2_ACCESS_KEY_ID,
  secretAccessKey: CONFIG.R2_SECRET_ACCESS_KEY,
  bucket: CONFIG.R2_BUCKET_NAME,
  publicUrl: CONFIG.R2_PUBLIC_URL ?? null,
}).port;

const materialService = createMaterialService({
  materialRepository,
  documentParser,
  materialAnalyzer,
  knowledge,
  r2,
  materialProcessingQueue: createMaterialProcessingQueuePort(
    queueRegistry.queues.materialProcessing,
  ),
});

// 2. Worker 초기화 및 실행
const materialProcessor = createMaterialProcessor({
  materialRepository,
  documentParser,
  materialAnalyzer,
  knowledge,
  r2,
});

const materialWorker = createMaterialProcessingWorker(
  { processMaterialUpload: materialProcessor },
  { connection, concurrency: CONFIG.QUEUE_CONCURRENCY },
);

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
  logger: createPlanLoggerPort(logger),
  materialReader: createMaterialReaderPort(materialRepository),
  knowledge,
  chatModel: aiModels.chat,
});

const planCore = createCorePlanService({
  db,
  planGeneration,
  planGenerationQueue: createPlanGenerationQueuePort(
    queueRegistry.queues.planGeneration,
  ),
  materialReader: createMaterialReaderPort(materialRepository),
});

const planWorker = createPlanGenerationWorker(
  { processPlanGeneration: planCore.createPlanProcessor },
  { connection, concurrency: CONFIG.QUEUE_CONCURRENCY },
);

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
