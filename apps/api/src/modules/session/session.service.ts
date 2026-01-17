import { abandonRun } from "./usecases/abandon-run";
import { completeRun } from "./usecases/complete-run";
import { createOrRecoverRun } from "./usecases/create-or-recover-run";
import { createRunActivity } from "./usecases/create-run-activity";
import { createRunCheckin } from "./usecases/create-run-checkin";
import { getHomeQueue } from "./usecases/get-home-queue";
import { getRunDetail } from "./usecases/get-run-detail";
import { listRunActivities } from "./usecases/list-run-activities";
import { listRunCheckins } from "./usecases/list-run-checkins";
import { listSessionRuns } from "./usecases/list-session-runs";
import { saveProgress } from "./usecases/save-progress";
import { updatePlanSession } from "./usecases/update-plan-session";

import type {
  RagRetrieverForSessionPort,
  SessionBlueprintGeneratorPort,
} from "./usecases/get-run-detail";
import type { SessionRepository } from "./session.repository";

export type SessionServiceDeps = {
  readonly sessionRepository: SessionRepository;
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

export function createSessionService(deps: SessionServiceDeps): SessionService {
  const usecaseDeps = { sessionRepository: deps.sessionRepository } as const;

  return {
    abandonRun: abandonRun(usecaseDeps),
    completeRun: completeRun(usecaseDeps),
    createOrRecoverRun: createOrRecoverRun(usecaseDeps),
    createRunActivity: createRunActivity(usecaseDeps),
    createRunCheckin: createRunCheckin(usecaseDeps),
    getHomeQueue: getHomeQueue(usecaseDeps),
    getRunDetail: getRunDetail({
      sessionRepository: deps.sessionRepository,
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
