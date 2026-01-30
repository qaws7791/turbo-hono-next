import { createAiModels } from "@repo/ai";
import { createKnowledgeService } from "@repo/core/modules/knowledge";
import {
  createAiMaterialAnalyzer,
  createDocumentParser,
  createMaterialProcessor,
  createMaterialReaderPort,
  createMaterialRepository,
} from "@repo/core/modules/material";
import {
  createAiPlanGeneration,
  createPlanLoggerPort,
  createPlanService,
} from "@repo/core/modules/plan";
import {
  createMaterialProcessingQueue,
  createMaterialProcessingWorker,
  createPlanGenerationQueue,
  createPlanGenerationQueuePort,
  createPlanGenerationWorker,
  createQueueRuntime,
  defaultJobOptions,
  getConnectionOptions,
} from "@repo/queue-bullmq";
import { createDb } from "@repo/database";
import { createR2StoragePortFromConfig } from "@repo/storage-r2";
import { errAsync } from "neverthrow";

import "dotenv/config";

import { CONFIG } from "./lib/config";
import { createLogger } from "./lib/logger";

import type {
  AiError,
  AiModels,
  ChatModelPort,
  EmbeddingModelPort,
} from "@repo/ai";

const logger = createLogger(CONFIG);

const db = createDb({ databaseUrl: CONFIG.DATABASE_URL });

const aiModels = createAiModelsOrUnavailable(CONFIG);

const knowledge = createKnowledgeService({
  databaseUrl: CONFIG.DATABASE_URL,
  embeddingModel: aiModels.embedding,
});

const materialRepository = createMaterialRepository(db);
const materialReader = createMaterialReaderPort(materialRepository);

const r2 = createR2StoragePortFromConfig({
  endpoint: CONFIG.R2_ENDPOINT,
  accessKeyId: CONFIG.R2_ACCESS_KEY_ID,
  secretAccessKey: CONFIG.R2_SECRET_ACCESS_KEY,
  bucket: CONFIG.R2_BUCKET_NAME,
  publicUrl: CONFIG.R2_PUBLIC_URL ?? null,
}).port;

const connection = getConnectionOptions({ redisUrl: CONFIG.REDIS_URL });
const queueRuntime = createQueueRuntime();
const materialProcessingQueue = createMaterialProcessingQueue({
  connection,
  defaultJobOptions,
});
queueRuntime.register(materialProcessingQueue);

const planGenerationQueue = createPlanGenerationQueue({
  connection,
  defaultJobOptions,
});
queueRuntime.register(planGenerationQueue);

const enabledWorkers = parseEnabledWorkers(CONFIG.WORKERS);

if (enabledWorkers.has("material")) {
  const documentParser = createDocumentParser();
  const materialAnalyzer = createAiMaterialAnalyzer({
    chatModel: aiModels.chat,
  });

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

  queueRuntime.register(materialWorker);

  materialWorker.on("error", (err) => {
    logger.error({ err }, "Material Worker Error");
  });

  materialWorker.on("failed", (job, err) => {
    logger.error(
      { jobId: job?.id, uploadId: job?.data.uploadId, err },
      "Material Job Failed",
    );
  });

  logger.info(
    { concurrency: CONFIG.QUEUE_CONCURRENCY },
    "Material worker started",
  );
}

if (enabledWorkers.has("plan")) {
  const planGeneration = createAiPlanGeneration({
    logger: createPlanLoggerPort(logger),
    materialReader,
    knowledge,
    chatModel: aiModels.chat,
  });

  const planCore = createPlanService({
    db,
    planGeneration,
    planGenerationQueue: createPlanGenerationQueuePort(planGenerationQueue),
    materialReader,
  });

  const planWorker = createPlanGenerationWorker(
    { processPlanGeneration: planCore.createPlanProcessor },
    { connection, concurrency: CONFIG.QUEUE_CONCURRENCY },
  );

  queueRuntime.register(planWorker);

  planWorker.on("error", (err) => {
    logger.error({ err }, "Plan Worker Error");
  });

  planWorker.on("failed", (job, err) => {
    logger.error(
      { jobId: job?.id, planId: job?.data.planId, err },
      "Plan Job Failed",
    );
  });

  logger.info({ concurrency: CONFIG.QUEUE_CONCURRENCY }, "Plan worker started");
}

if (enabledWorkers.size === 0) {
  logger.warn(
    "No workers enabled. Set WORKERS=material,plan (default) to start workers.",
  );
}

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received. Shutting down...");
  await queueRuntime.shutdown();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received. Shutting down...");
  await queueRuntime.shutdown();
  process.exit(0);
});

function parseEnabledWorkers(
  value: string | undefined,
): Set<"material" | "plan"> {
  if (!value) return new Set(["material", "plan"]);
  const tokens = value
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);

  const set = new Set<"material" | "plan">();
  for (const token of tokens) {
    if (token === "material" || token === "plan") set.add(token);
  }
  return set;
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

  logger.warn(
    { error },
    "AI is unavailable; workers will fail until configured",
  );

  return { chat, embedding };
}
