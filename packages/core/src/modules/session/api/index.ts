import { abandonRun } from "../internal/application/abandon-run";
import { completeRun } from "../internal/application/complete-run";
import { createOrRecoverRun } from "../internal/application/create-or-recover-run";
import { createRunActivity } from "../internal/application/create-run-activity";
import { createRunCheckin } from "../internal/application/create-run-checkin";
import { getHomeQueue } from "../internal/application/get-home-queue";
import { getRunDetail } from "../internal/application/get-run-detail";
import { listRunActivities } from "../internal/application/list-run-activities";
import { listRunCheckins } from "../internal/application/list-run-checkins";
import { listSessionRuns } from "../internal/application/list-session-runs";
import { saveProgress } from "../internal/application/save-progress";
import { updatePlanSession } from "../internal/application/update-plan-session";
import { createSessionRepository } from "../internal/infrastructure/session.repository";

import type { Database } from "@repo/database";
import type {
  RagRetrieverForSessionPort,
  SessionBlueprintGeneratorPort,
} from "./ports";

export * from "./schema";
export * from "./ports";

export type CreateSessionServiceDeps = {
  readonly db: Database;
  readonly ragRetriever: RagRetrieverForSessionPort;
  readonly sessionBlueprintGenerator: SessionBlueprintGeneratorPort;
};

export type SessionService = {
  readonly abandonRun: ReturnType<typeof abandonRun>;
  readonly completeRun: ReturnType<typeof completeRun>;
  readonly createOrRecoverRun: ReturnType<typeof createOrRecoverRun>;
  readonly createRunActivity: ReturnType<typeof createRunActivity>;
  readonly createRunCheckin: ReturnType<typeof createRunCheckin>;
  readonly getHomeQueue: ReturnType<typeof getHomeQueue>;
  readonly getRunDetail: ReturnType<typeof getRunDetail>;
  readonly listRunActivities: ReturnType<typeof listRunActivities>;
  readonly listRunCheckins: ReturnType<typeof listRunCheckins>;
  readonly listSessionRuns: ReturnType<typeof listSessionRuns>;
  readonly saveProgress: ReturnType<typeof saveProgress>;
  readonly updatePlanSession: ReturnType<typeof updatePlanSession>;
};

export function createSessionService(
  deps: CreateSessionServiceDeps,
): SessionService {
  const sessionRepository = createSessionRepository(deps.db);
  const usecaseDeps = { sessionRepository } as const;

  return {
    abandonRun: abandonRun(usecaseDeps),
    completeRun: completeRun(usecaseDeps),
    createOrRecoverRun: createOrRecoverRun(usecaseDeps),
    createRunActivity: createRunActivity(usecaseDeps),
    createRunCheckin: createRunCheckin(usecaseDeps),
    getHomeQueue: getHomeQueue(usecaseDeps),
    getRunDetail: getRunDetail({
      sessionRepository,
      ragRetriever: deps.ragRetriever,
      sessionBlueprintGenerator: deps.sessionBlueprintGenerator,
    }),
    listRunActivities: listRunActivities(usecaseDeps),
    listRunCheckins: listRunCheckins(usecaseDeps),
    listSessionRuns: listSessionRuns(usecaseDeps),
    saveProgress: saveProgress(usecaseDeps),
    updatePlanSession: updatePlanSession(usecaseDeps),
  };
}
