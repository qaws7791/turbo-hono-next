import { serve } from "@hono/node-server";

import "dotenv/config";
import { documentParser } from "./ai/ingestion/parse";
import { materialAnalyzer } from "./ai/material";
import { createLearningPlanGenerator } from "./ai/plan";
import { ragIngestor, ragRetriever, ragVectorStoreManager } from "./ai/rag";
import { sessionBlueprintGenerator } from "./ai/session";
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
import { createAuthRepository, createAuthService } from "./modules/auth";
import {
  createMaterialProcessor,
  createMaterialRepository,
  createMaterialService,
} from "./modules/material";
import {
  createPlanProcessor,
  createPlanRepository,
  createPlanService,
} from "./modules/plan";
import {
  createSessionRepository,
  createSessionService,
} from "./modules/session";

import type { AppDeps } from "./app-deps";

const logger = createLogger(CONFIG);
const db = createDatabase(CONFIG);

// 1. Queue 초기화
const queueRegistry = initializeQueueRegistry();

const authRepository = createAuthRepository({ db, config: CONFIG, logger });
const materialRepository = createMaterialRepository(db);
const planRepository = createPlanRepository(db);
const sessionRepository = createSessionRepository(db);

const authService = createAuthService({ authRepository, config: CONFIG });

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
  ragIngestor,
  ragRetriever,
  ragVectorStoreManager,
  r2,
  materialProcessingQueue: queueRegistry.queues.materialProcessing,
});

// 2. Worker 초기화 및 실행
const materialProcessor = createMaterialProcessor({
  materialRepository,
  documentParser,
  materialAnalyzer,
  ragIngestor,
  ragVectorStoreManager,
  r2,
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

const learningPlanGenerator = createLearningPlanGenerator({
  logger,
  materialRepository,
  ragRetriever,
});

const planGeneration = {
  generatePlan: learningPlanGenerator.generate.bind(learningPlanGenerator),
};

const planProcessor = createPlanProcessor({
  planRepository,
  planGeneration,
});

const planWorker = createPlanGenerationWorker({
  processPlanGeneration: planProcessor,
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

const planService = createPlanService({
  planRepository,
  materialRepository,
  planGeneration,
  planGenerationQueue: queueRegistry.queues.planGeneration,
});
const sessionService = createSessionService({
  sessionRepository,
  ragRetriever,
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
