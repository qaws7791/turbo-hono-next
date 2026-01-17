import { serve } from "@hono/node-server";

import "dotenv/config";
import { CONFIG } from "./lib/config";
import { createDatabase } from "./lib/db";
import { createLogger } from "./lib/logger";
import { createApp } from "./app";
import { createAuthRepository, createAuthService } from "./modules/auth";
import {
  createMaterialRepository,
  createMaterialService,
} from "./modules/material";
import { createPlanRepository, createPlanService } from "./modules/plan";
import {
  createSessionRepository,
  createSessionService,
} from "./modules/session";
import { documentParser } from "./ai/ingestion/parse";
import { materialAnalyzer } from "./ai/material";
import { ragIngestor, ragRetriever, ragVectorStoreManager } from "./ai/rag";
import { sessionBlueprintGenerator } from "./ai/session";
import { learningPlanGenerator } from "./ai/plan/generator";
import {
  copyObject,
  createPresignedPutUrl,
  deleteObject,
  getObjectBytes,
  headObject,
} from "./lib/r2";

import type { AppDeps } from "./app-deps";

const logger = createLogger(CONFIG);
const db = createDatabase(CONFIG);

const authRepository = createAuthRepository({ db, config: CONFIG, logger });
const materialRepository = createMaterialRepository(db);
const planRepository = createPlanRepository(db);
const sessionRepository = createSessionRepository(db);

const authService = createAuthService({ authRepository, config: CONFIG });
const materialService = createMaterialService({
  materialRepository,
  documentParser,
  materialAnalyzer,
  ragIngestor,
  ragRetriever,
  ragVectorStoreManager,
  r2: {
    createPresignedPutUrl,
    headObject,
    getObjectBytes,
    copyObject,
    deleteObject,
  },
});
const planService = createPlanService({
  planRepository,
  materialRepository,
  planGeneration: {
    generatePlan: async (input) => learningPlanGenerator.generate(input),
  },
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

serve(
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
