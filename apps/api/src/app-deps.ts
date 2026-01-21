import type { Logger } from "pino";
import type { Config } from "./lib/config";
import type { AuthService } from "./modules/auth";
import type { MaterialService } from "./modules/material";
import type { PlanService } from "./modules/plan";
import type { SessionService } from "./modules/session";

export type AppServices = {
  readonly auth: AuthService;
  readonly material: MaterialService;
  readonly plan: PlanService;
  readonly session: SessionService;
};

export type AppDeps = {
  readonly config: Config;
  readonly logger: Logger;
  readonly services: AppServices;
};
