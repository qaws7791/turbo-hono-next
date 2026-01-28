import type { Logger } from "pino";
import type { Config } from "./lib/config";
import type { AuthService } from "@repo/core/modules/auth";
import type { MaterialService } from "@repo/core/modules/material";
import type { PlanService } from "@repo/core/modules/plan";
import type { SessionService } from "@repo/core/modules/session";

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
